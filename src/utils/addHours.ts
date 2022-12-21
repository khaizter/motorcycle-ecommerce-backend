const addHours = (date: Date, hours: number): Date => {
  date.setHours(date.getHours() + hours);

  return date;
};

export default addHours;
