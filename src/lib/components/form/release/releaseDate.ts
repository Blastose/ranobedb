export class DateNumber {
	date: number;

	constructor(date: number) {
		this.date = date;
	}

	hasLeapYear(year: number) {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	extractYearMonthDay() {
		const year = this.getYear();
		const month = this.getMonth();
		const day = this.getDay();

		return {
			year,
			month,
			day
		};
	}

	getYear() {
		return Math.floor(this.date / 10000);
	}
	getMonth() {
		return Math.floor((this.date % 10000) / 100);
	}
	getDay() {
		return this.date % 100;
	}

	setYear(newYear: number) {
		if (newYear > 9999 || newYear < 1000) throw new Error();
		const { month, day } = this.extractYearMonthDay();

		this.date = newYear * 10000 + month * 100 + day;
		return this.date;
	}

	setMonth(newMonth: number) {
		if (newMonth > 99 || newMonth < 1) throw new Error();
		const { year, day } = this.extractYearMonthDay();

		this.date = year * 10000 + newMonth * 100 + day;
		return this.date;
	}

	setDay(newDay: number) {
		if (newDay > 99 || newDay < 1) throw new Error();
		const { year, month } = this.extractYearMonthDay();

		this.date = year * 10000 + month * 100 + newDay;
		return this.date;
	}

	getDateFormatted() {
		const { year, month, day } = this.extractYearMonthDay();
		if (year === 9999) {
			return 'TBA';
		}
		if (month === 99) {
			return `${year}`;
		}
		let monthFormatted: string | number = month;
		if (month < 10) {
			monthFormatted = `0${month}`;
		}
		let dayFormatted: string | number = day;
		if (day < 10) {
			dayFormatted = `0${day}`;
		}

		if (day === 99) {
			return `${year}-${monthFormatted}`;
		}

		return `${year}-${monthFormatted}-${dayFormatted}`;
	}
}
