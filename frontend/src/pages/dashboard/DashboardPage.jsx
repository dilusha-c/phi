import { useEffect, useState, useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2, FileText, Users, BarChart3, PieChart } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ActivityTable from '../../components/dashboard/ActivityTable';
import QuickActions from '../../components/dashboard/QuickActions';
import { patientService } from '../../services/patientService';
import { activityService } from '../../services/activityService';
import { mapService } from '../../services/mapService';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeCases: 0,
    recoveredPatients: 0,
    totalActivities: 0,
    highRiskAreas: 0
  });

  const [districts, setDistricts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static dummy trend data for 12 months (e.g. from July of last year to June)
  const monthlyCases = [12, 19, 25, 22, 30, 38, 45, 41, 52, 49, 58, 65];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [patientsRes, statsRes, activitiesRes, casesListRes] = await Promise.all([
          patientService.getPatients({ limit: 1 }),
          mapService.getStatistics(),
          activityService.getActivities({ limit: 1 }),
          mapService.getMapCases({ limit: 5 })
        ]);

        // 1. Calculate General Totals
        const totalPats = patientsRes.meta?.totalRecords || 0;
        const totalActs = activitiesRes.meta?.totalRecords || 0;
        const activeCount = statsRes.data?.statusBreakdown?.find(i => i._id === 'Active')?.count || 0;
        const recoveredCount = statsRes.data?.statusBreakdown?.find(i => i._id === 'Recovered')?.count || 0;
        const districtCount = statsRes.data?.districtBreakdown?.length || 0;

        setStats({
          totalPatients: totalPats,
          activeCases: activeCount,
          recoveredPatients: recoveredCount,
          totalActivities: totalActs,
          highRiskAreas: districtCount
        });

        // 2. Parse District Breakdown
        const parsedDistricts = (statsRes.data?.districtBreakdown || []).map(d => ({
          district: d._id || 'Unknown',
          value: d.count
        })).slice(0, 5); // top 5 districts
        setDistricts(parsedDistricts);

        // 3. Parse Case Status Breakdown percentages
        const statusTotal = statsRes.data?.statusBreakdown?.reduce((sum, item) => sum + item.count, 0) || 1;
        const parsedStatuses = (statsRes.data?.statusBreakdown || []).map(item => {
          let color = 'bg-sky-500';
          if (item._id === 'Recovered') color = 'bg-emerald-500';
          if (item._id === 'Deceased') color = 'bg-rose-500';
          if (item._id === 'Transferred') color = 'bg-amber-500';
          
          return {
            label: item._id,
            value: `${((item.count / statusTotal) * 100).toFixed(0)}%`,
            color
          };
        });
        setStatuses(parsedStatuses);

        // 4. Parse Recent Patient Cases
        const parsedCases = (casesListRes.data || []).map(c => {
          let statusClass = 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';
          if (c.currentStatus === 'Recovered') {
            statusClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
          } else if (c.currentStatus === 'Deceased') {
            statusClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
          }
          
          return {
            patientName: c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : 'Dengue Patient',
            caseId: c.caseId,
            status: c.currentStatus,
            statusClass,
            hospital: c.hospital || 'Hospital Record',
            lastUpdated: new Date(c.diagnosisDate).toLocaleDateString()
          };
        });
        setRecentCases(parsedCases);

      } catch (err) {
        console.error('Error fetching dashboard statistics details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summaryCards = useMemo(() => {
    return [
      { title: 'Total Patients Registered', value: stats.totalPatients, icon: Users, tone: 'blue', change: 'Surveillance patient registry' },
      { title: 'Active Dengue Cases', value: stats.activeCases, icon: Activity, tone: 'primary', change: 'Patients undergoing treatment' },
      { title: 'Recovered Patients', value: stats.recoveredPatients, icon: CheckCircle2, tone: 'emerald', change: 'Successfully discharged' },
      { title: 'Logged PHI Activities', value: stats.totalActivities, icon: FileText, tone: 'amber', change: 'Inspector entries logged' },
    ];
  }, [stats]);

  if (loading) {
    return <LoadingSpinner label="Compiling dashboard analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-6 text-white shadow-soft sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-200">Healthcare Surveillance Dashboard</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Sri Lanka Dengue Surveillance & PHI Management System</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
            Monitor real-time dengue patient counts, coordinate PHI field sweeps, and manage geographical outbreaks in one centralized system.
          </p>
        </div>
      </section>

      {/* Summary Stats Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </section>

      {/* Analytics Charts */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Month Cases Trend */}
        <ChartCard title="Monthly Dengue Cases" subtitle="Active seasonal statistics trends">
          <div className="flex h-64 items-end gap-3 pt-4">
            {monthlyCases.map((value, index) => (
              <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-primary-700 to-primary-400 shadow-soft transition-all duration-300 hover:from-primary-650 hover:to-primary-350" style={{ height: `${Math.max(value * 2.5, 12)}px` }} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">M{index + 1}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Districts breakdown */}
        <ChartCard title="Cases by District" subtitle="Highest reporting districts">
          <div className="space-y-4 pt-2">
            {districts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No district distribution data available.</p>
            ) : (
              districts.map((item) => {
                const maxVal = districts[0]?.value || 1;
                const percentage = (item.value / maxVal) * 100;
                return (
                  <div key={item.district} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200">{item.district}</span>
                      <span className="text-slate-500 dark:text-slate-400">{item.value} cases</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>

        {/* Status Distribution pie count */}
        <ChartCard title="Case Status Distribution" subtitle="Active patient snapshot breakdown">
          <div className="space-y-4 pt-2">
            {statuses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No status snapshot details available.</p>
            ) : (
              statuses.map((item) => (
                <div key={item.label} className="flex items-center gap-4 rounded-2xl bg-slate-50/50 p-3 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800">
                  <div className={`h-3 w-3 rounded-full ${item.color} shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className="text-primary-650 dark:text-primary-400">{item.value}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </section>

      {/* Main Grid: Recent Activities Table & Quick Tasks Sidebar */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Left: Recent Cases Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Mapped Cases</h3>
          </div>
          {recentCases.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No recent cases recorded.
            </div>
          ) : (
            <ActivityTable rows={recentCases} />
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-4">
          <QuickActions />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
