import {derived} from 'svelte/store';
import {createSlotTimeLimits, createTimes, getWeekNumber, getPayload} from '@event-calendar/core';

// slotTimeLimits per day
export function dayTimeLimits(state) {
    return derived(
        [state.slotMinTime, state.slotMaxTime, state.flexibleSlotTimeLimits, state._viewDates, state._events],
        ([$slotMinTime, $slotMaxTime, $flexibleSlotTimeLimits, $_viewDates, $_events]) => {
            let dayTimeLimits = {};
            for (let date of $_viewDates) {
                dayTimeLimits[date.getTime()] = createSlotTimeLimits(
                    $slotMinTime,
                    $slotMaxTime,
                    $flexibleSlotTimeLimits,
                    [date],
                    $_events
                );
            }

            return dayTimeLimits;
        }
    );
}

export function dayTimes(state) {
    return derived(
        [state._viewDates, state.slotDuration, state._dayTimeLimits, state._intlSlotLabel],
        ([$_viewDates, $slotDuration, $_dayTimeLimits, $_intlSlotLabel]) => {
            let dayTimes = {};
            for (let date of $_viewDates) {
                let time = date.getTime();
                dayTimes[time] = time in $_dayTimeLimits
                    ? createTimes(date, $slotDuration, $_dayTimeLimits[time], $_intlSlotLabel)
                    : [];
            }

            return dayTimes;
        }
    );
}

export function weekDays(state) {
    return derived(
        [state._viewDates],
        ([$_viewDates]) => {
            return getOneDayPerWeek($_viewDates)
        }
    );
}

export function daysInWeek(state) {
    return derived(
        [state._viewDates],
        ([$_viewDates]) => {
            return getWeekWithAllDays($_viewDates)
        }
    );
}

function getOneDayPerWeek(datesArray) {
    const weeks = {};
    const result = [];

    datesArray.forEach((date) => {
        const weekNumber = getWeekNumber(date);
        const year = date.getUTCFullYear();

        const yearWeekKey = `${year}-${weekNumber}`;


        if (!weeks[yearWeekKey]) {
            weeks[yearWeekKey] = date;
            result.push(date);
        }
    });

    return result;
}

function getWeekWithAllDays(datesArray) {
    const weeks = {};

    datesArray.forEach((date) => {
        const weekNumber = getWeekNumber(date);
        const year = date.getUTCFullYear();

        const yearWeekKey = `${year}-${weekNumber}`;

        if (!weeks[yearWeekKey]) {
            weeks[yearWeekKey] = {
                firstDay: date,
                allDays: []
            };
        }

        weeks[yearWeekKey].allDays.push(date);
    });

    const result = {};
    for (const key in weeks) {
        result[weeks[key].firstDay] = weeks[key].allDays;
    }

    return result;
}

export function nestedResources(state) {
    return derived(state.resources, $resources => $resources.some(resource => getPayload(resource).children.length));
}
