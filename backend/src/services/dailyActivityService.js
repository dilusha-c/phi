const DailyActivity = require("../models/DailyActivity");

const generateActivityLogId = async (phiId, dateStr) => {
  const dateObj = new Date(dateStr);
  const formattedDate = dateObj.toISOString().slice(0, 10).replace(/-/g, "");

  // Match start and end of this specific day in local time or ISO range
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await DailyActivity.countDocuments({
    phiId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  const sequence = String(count + 1).padStart(3, "0");
  // Remove spaces or special characters from PHI ID to make unique code clean
  const sanitizedPhi = phiId.replace(/[^a-zA-Z0-9]/g, "");
  return `ACT-${sanitizedPhi}-${formattedDate}-${sequence}`;
};

const createDailyActivity = async (payload) => {
  const { phiId, date, activities, notes } = payload;
  const activityLogId = await generateActivityLogId(phiId, date);

  const dailyActivity = await DailyActivity.create({
    activityLogId,
    phiId,
    date,
    activities,
    notes,
  });

  return dailyActivity;
};

const getDailyActivities = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 10, 1), 2000);
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.phiId) {
    query.phiId = { $regex: filters.phiId.trim(), $options: "i" };
  }

  if (filters.phiName) {
    const User = require("../models/User");
    const matchingUsers = await User.find({
      name: { $regex: filters.phiName.trim(), $options: "i" }
    });
    const matchingPhiIds = matchingUsers.map(u => u.phiId).filter(Boolean);
    query.phiId = { $in: matchingPhiIds };
  }

  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  } else if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const [activities, totalRecords] = await Promise.all([
    DailyActivity.find(query).populate("activities.patient").sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
    DailyActivity.countDocuments(query),
  ]);

  const User = require("../models/User");
  const phiIds = [...new Set(activities.map(a => a.phiId).filter(Boolean))];
  const users = await User.find({ phiId: { $in: phiIds } }).select("name phiId");
  const userMap = Object.fromEntries(users.map(u => [u.phiId, u.name]));

  const activitiesWithNames = activities.map(act => {
    const rawObj = act.toObject();
    rawObj.phiName = userMap[act.phiId] || "Unknown PHI";
    return rawObj;
  });

  return {
    activities: activitiesWithNames,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit) || 1,
    },
  };
};

const getDailyActivityById = async (id) => {
  const activity = await DailyActivity.findById(id).populate("activities.patient");
  if (!activity) return null;

  const User = require("../models/User");
  const user = await User.findOne({ phiId: activity.phiId }).select("name");

  const rawObj = activity.toObject();
  rawObj.phiName = user ? user.name : "Unknown PHI";
  return rawObj;
};

const updateDailyActivity = async (id, payload) => {
  const dailyActivity = await DailyActivity.findById(id);
  if (!dailyActivity) {
    return null;
  }

  dailyActivity.phiId = payload.phiId || dailyActivity.phiId;
  dailyActivity.date = payload.date || dailyActivity.date;
  dailyActivity.activities = payload.activities || dailyActivity.activities;
  dailyActivity.notes = payload.notes !== undefined ? payload.notes : dailyActivity.notes;

  await dailyActivity.save();
  return dailyActivity;
};

module.exports = {
  createDailyActivity,
  getDailyActivities,
  getDailyActivityById,
  updateDailyActivity,
};
