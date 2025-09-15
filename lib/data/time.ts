export class CalendarDate {
    year: number;
    month: number;
    day: number;

    constructor(year: number, month: number, day: number) {
        this.year = year;
        this.month = month;
        this.day = day;
    }

    static fromDateObject(date: Date): CalendarDate {
        return new CalendarDate(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );
    }

    static fromString(str: string): CalendarDate {
        if (str.includes("T")) {
            str = str.split("T")[0];
        }

        const parts = str.split("-");

        return new CalendarDate(
            parseInt(parts[0]),
            parseInt(parts[1]),
            parseInt(parts[2])
        );
    }

    toDateObject(): Date {
    return new Date(this.year, this.month - 1, this.day);
}

    toString(): string {
        return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
    }

    compare(date: CalendarDate): -1 | 0 | 1 {
        if (this.year < date.year) return -1;
        if (this.year > date.year) return 1;
      
        if (this.month < date.month) return -1;
        if (this.month > date.month) return 1;
      
        if (this.day < date.day) return -1;
        if (this.day > date.day) return 1;
      
        return 0;
    }

    isSmallerThen(date: CalendarDate): boolean {
        return this.compare(date) === -1;
    }
    
    isBiggerThen(date: CalendarDate): boolean {
        return this.compare(date) === 1;
    }

    isSmallerOrEqual(date: CalendarDate): boolean {
        return this.compare(date) === -1 || this.compare(date) === 0;
    }

    isBiggerOrEqual(date: CalendarDate): boolean {
        return this.compare(date) === 1 || this.compare(date) === 0;
    }
    
    equals(date: CalendarDate): boolean {
        return this.compare(date) === 0;
    }
}

export class DayTime {
    hour: number;
    minute: number;

    constructor(hour: number, minute: number) {
        this.hour = hour;
        this.minute = minute;
    }

    static fromString(str: string): DayTime {
        const [hours, minutes] = str.split(":")
        return new DayTime(parseInt(hours), parseInt(minutes))
    }

    toString(): string {
        return `${String(this.hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`
    }

    toMinutes(): number {
        return this.hour * 60 + this.minute
    }

    isValid(): boolean {
        return (this.minute >= 0 && this.minute <= 59 && this.hour >= 0 && this.hour <= 23) || this.hour === 24 && this.minute === 0
    }

    compare(time: DayTime): -1 | 0 | 1 {
        if (this.hour < time.hour) return -1;
        if (this.hour > time.hour) return 1;
      
        if (this.minute < time.minute) return -1;
        if (this.minute > time.minute) return 1;
      
        return 0;
    }

    isSmallerThen(time: DayTime): boolean {
        return this.compare(time) === -1;
    }
    
    isBiggerThen(time: DayTime): boolean {
        return this.compare(time) === 1;
    }

    isSmallerOrEqual(time: DayTime): boolean {
        return this.compare(time) === -1 || this.compare(time) === 0;
    }

    isBiggerOrEqual(time: DayTime): boolean {
        return this.compare(time) === 1 || this.compare(time) === 0;
    }
    
    equals(time: DayTime): boolean {
        return this.compare(time) === 0;
    }
}

export class DateRange {
    start: CalendarDate | null;
    end: CalendarDate | null;

    constructor(start: CalendarDate | null, end: CalendarDate | null) {
        this.start = start;
        this.end = end;
    };

    static fromString(startStr: string | null, endStr: string | null): DateRange {
        return new DateRange(
            startStr ? CalendarDate.fromString(startStr) : null,
            endStr ? CalendarDate.fromString(endStr) : null,
        )
    }

    ensure(): {start: CalendarDate, end: CalendarDate} {
        return {start: this.start ?? new CalendarDate(0, 0, 0), end: this.end || new CalendarDate(Infinity, Infinity, Infinity)};
    }

    isInRange(date: CalendarDate): boolean {
        const range = this.ensure();
        return range.start.isSmallerOrEqual(date) && range.end.isBiggerOrEqual(date);
    }
}

export class TimeRange {
    start: DayTime;
    end: DayTime;

    constructor(start: DayTime, end: DayTime) {
        this.start = start;
        this.end = end;
    };

    static fromString(startStr: string, endStr: string): TimeRange {
        return new TimeRange(DayTime.fromString(startStr), DayTime.fromString(endStr),)
    }

    isInRange(date: DayTime): boolean {
        return this.start.isSmallerOrEqual(date) && this.end.isBiggerOrEqual(date);
    }

    areOverlapping(range: TimeRange): boolean {
        return this.start.isSmallerThen(range.end) && this.end.isBiggerThen(range.start);
    }
}
