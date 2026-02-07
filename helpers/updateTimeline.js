export const pushTimeline = (order, status, updatedBy = "System", remark = "") => {
  order.timeline.push({
    status,
    updatedBy,
    remark,
    date: new Date(),
  });
};
