export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., 'Mon'
      fullLabel: d.toLocaleDateString('en-US', { weekday: 'long' }), // e.g., 'Monday'
      date: d.getDate(), // e.g., 30
      isToday: i === 0,
      fullDate: d // Object for comparison if needed
    });
  }
  return days;
};

export const getNextRefillDate = (subscriptionStart = new Date(), cycleDays = 30) => {
  const nextDate = new Date(subscriptionStart);
  nextDate.setDate(nextDate.getDate() + cycleDays);
  return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};
