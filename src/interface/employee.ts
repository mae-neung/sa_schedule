interface Employee {
  name: string;
  workCount: number;
  targetWorkCount: number;
  isNight: boolean;
  isNew?: boolean;
  prevWorkCount?: number;
}

export default Employee;
