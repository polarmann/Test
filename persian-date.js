// Persian Date Utilities
class PersianDate {
    constructor(year = null, month = null, day = null) {
        if (year === null && month === null && day === null) {
            // Get current Persian date
            const now = new Date();
            const persianDate = this.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
            this.year = persianDate.year;
            this.month = persianDate.month;
            this.day = persianDate.day;
        } else {
            this.year = year;
            this.month = month;
            this.day = day;
        }
    }

    // Convert Gregorian to Persian date
    gregorianToPersian(gYear, gMonth, gDay) {
        const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        
        if (gYear <= 1600) {
            let jYear = 0;
            let gYear = gYear - 621;
            if (gMonth > 2) {
                const gy2 = gYear + 1;
                const days = (365 * gYear) + ((gy2 + 3) / 4) + g_d_m[gMonth - 1] + gDay;
                jYear = -14 + 33 * (Math.floor(days / 12053));
                days %= 12053;
                
                jYear += 4 * (Math.floor(days / 1461));
                days %= 1461;
                
                if (days > 365) {
                    jYear += Math.floor((days - 1) / 365);
                    days = (days - 1) % 365;
                }
            }
        } else {
            let gYear = gYear - 1600;
            let gMonth = gMonth - 1;
            let gDay = gDay - 1;

            let gDayNo = 365 * gYear + Math.floor((gYear + 3) / 4) - Math.floor((gYear + 99) / 100) + 
                        Math.floor((gYear + 399) / 400) - 80 + gDay + g_d_m[gMonth];

            let jYear = -1029 + 33 * Math.floor(gDayNo / 12053);
            gDayNo = gDayNo % 12053;

            jYear += 4 * Math.floor(gDayNo / 1461);
            gDayNo %= 1461;

            if (gDayNo >= 366) {
                jYear += Math.floor((gDayNo - 1) / 365);
                gDayNo = (gDayNo - 1) % 365;
            }

            let jMonth, jDay;
            if (gDayNo < 186) {
                jMonth = 1 + Math.floor(gDayNo / 31);
                jDay = 1 + (gDayNo % 31);
            } else {
                jMonth = 7 + Math.floor((gDayNo - 186) / 30);
                jDay = 1 + ((gDayNo - 186) % 30);
            }

            return { year: jYear, month: jMonth, day: jDay };
        }
    }

    // Convert Persian to Gregorian date
    persianToGregorian(jYear, jMonth, jDay) {
        let gYear = 1600;
        let gMonth = 1;
        let gDay = 1;

        jYear -= 979;
        
        let jDayNo = 365 * jYear + (Math.floor(jYear / 33)) * 8 + Math.floor(((jYear % 33) + 3) / 4) + 
                     78 + jDay + ((jMonth < 7) ? (jMonth - 1) * 31 : ((jMonth - 7) * 30) + 186);

        let gDayNo = jDayNo + 79;

        const leap = Math.floor((gYear - 1600) / 4) - Math.floor((gYear - 1600) / 100) + 
                    Math.floor((gYear - 1600) / 400) + Math.floor((1600 - 1600) / 4) - 
                    Math.floor((1600 - 1600) / 100) + Math.floor((1600 - 1600) / 400);

        if (gDayNo <= 366) {
            gYear = 1600;
            if ((gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0)) {
                if (gDayNo <= 366) {
                    if (gDayNo <= 31) {
                        gMonth = 1;
                        gDay = gDayNo;
                    } else if (gDayNo <= 60) {
                        gMonth = 2;
                        gDay = gDayNo - 31;
                    } else if (gDayNo <= 91) {
                        gMonth = 3;
                        gDay = gDayNo - 60;
                    } else if (gDayNo <= 121) {
                        gMonth = 4;
                        gDay = gDayNo - 91;
                    } else if (gDayNo <= 152) {
                        gMonth = 5;
                        gDay = gDayNo - 121;
                    } else if (gDayNo <= 182) {
                        gMonth = 6;
                        gDay = gDayNo - 152;
                    } else if (gDayNo <= 213) {
                        gMonth = 7;
                        gDay = gDayNo - 182;
                    } else if (gDayNo <= 244) {
                        gMonth = 8;
                        gDay = gDayNo - 213;
                    } else if (gDayNo <= 274) {
                        gMonth = 9;
                        gDay = gDayNo - 244;
                    } else if (gDayNo <= 305) {
                        gMonth = 10;
                        gDay = gDayNo - 274;
                    } else if (gDayNo <= 335) {
                        gMonth = 11;
                        gDay = gDayNo - 305;
                    } else {
                        gMonth = 12;
                        gDay = gDayNo - 335;
                    }
                }
            }
        } else {
            gYear = 1600 + Math.floor((gDayNo - 366) / 365);
            gDayNo = ((gDayNo - 366) % 365) + 1;
            
            const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if ((gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0)) {
                monthDays[1] = 29;
            }
            
            let daySum = 0;
            for (let i = 0; i < 12; i++) {
                daySum += monthDays[i];
                if (gDayNo <= daySum) {
                    gMonth = i + 1;
                    gDay = gDayNo - (daySum - monthDays[i]);
                    break;
                }
            }
        }

        return { year: gYear, month: gMonth, day: gDay };
    }

    // Add days to current Persian date
    addDays(days) {
        const gregorian = this.persianToGregorian(this.year, this.month, this.day);
        const date = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
        date.setDate(date.getDate() + days);
        
        const newPersian = this.gregorianToPersian(date.getFullYear(), date.getMonth() + 1, date.getDate());
        return new PersianDate(newPersian.year, newPersian.month, newPersian.day);
    }

    // Format as YYYY/MM/DD
    format() {
        return `${this.year}/${String(this.month).padStart(2, '0')}/${String(this.day).padStart(2, '0')}`;
    }

    // Get Persian month name
    getMonthName() {
        const monthNames = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        return monthNames[this.month - 1];
    }

    // Get Persian day name
    getDayName() {
        const gregorian = this.persianToGregorian(this.year, this.month, this.day);
        const date = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
        const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
        return dayNames[date.getDay()];
    }

    // Compare dates
    isEqual(otherDate) {
        return this.year === otherDate.year && 
               this.month === otherDate.month && 
               this.day === otherDate.day;
    }

    // Check if date is before another date
    isBefore(otherDate) {
        if (this.year < otherDate.year) return true;
        if (this.year > otherDate.year) return false;
        if (this.month < otherDate.month) return true;
        if (this.month > otherDate.month) return false;
        return this.day < otherDate.day;
    }

    // Check if date is after another date
    isAfter(otherDate) {
        return !this.isBefore(otherDate) && !this.isEqual(otherDate);
    }

    // Static method to create from string (YYYY/MM/DD)
    static fromString(dateString) {
        const parts = dateString.split('/');
        return new PersianDate(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    }

    // Static method to get today
    static today() {
        return new PersianDate();
    }

    // Validate Persian date
    static isValid(year, month, day) {
        if (month < 1 || month > 12) return false;
        if (day < 1) return false;
        
        // First 6 months have 31 days
        if (month <= 6 && day > 31) return false;
        
        // Next 5 months have 30 days
        if (month >= 7 && month <= 11 && day > 30) return false;
        
        // Last month has 29 or 30 days depending on leap year
        if (month === 12) {
            const isLeap = this.isLeapYear(year);
            if (day > (isLeap ? 30 : 29)) return false;
        }
        
        return true;
    }

    // Check if Persian year is leap
    static isLeapYear(year) {
        const breaks = [-14, 3, 13, 84, 111, 181, 210, 342, 382, 409, 480, 518, 571, 623, 692, 745, 818, 892, 960, 1029, 1106, 1153, 1200, 1260, 1316, 1370, 1404, 1435];
        
        let jp = breaks[0];
        let jump = 0;
        for (let j = 1; j <= breaks.length; j++) {
            const jm = breaks[j];
            jump = jm - jp;
            if (year < jm) break;
            jp = jm;
        }
        
        let n = year - jp;
        
        if (n < jump) {
            if (jump - n < 6) n = n - jump + ((jump + 4) / 6) * 6;
            
            let leap;
            if ((jump % 6) === 0) {
                leap = ((n + 1) % 6) === 0;
            } else {
                leap = ((n + 1) % 6) === 0 || ((jump % 6) < 5 && ((n + 1) % 6) < (jump % 6));
            }
            return leap;
        }
        
        return false;
    }

    // Convert Persian numbers to English
    static toEnglishNumbers(str) {
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        for (let i = 0; i < persianNumbers.length; i++) {
            str = str.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
        }
        
        return str;
    }

    // Convert English numbers to Persian
    static toPersianNumbers(str) {
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        
        for (let i = 0; i < englishNumbers.length; i++) {
            str = str.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
        }
        
        return str;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersianDate;
}
