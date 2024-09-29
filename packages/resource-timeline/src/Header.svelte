<script>
    import {getContext} from 'svelte';
    import {setContent, toISOString, toSeconds, getWeekNumber} from '@event-calendar/core';

    let {_headerEl, _intlDayHeader, _intlDayHeaderAL,_intlMonthHeader, _dayTimes, _viewDates, _weekDays, _daysInWeek, slotDuration, theme} = getContext('state');
</script>

<div class="{$theme.header}" bind:this={$_headerEl}>
    <div class="{$theme.days}" role="row">
        {#if toSeconds($slotDuration)}
            {#each $_viewDates as date}
                <div class="{$theme.day} {$theme.weekdays?.[date.getUTCDay()]}">
                        <div class="{$theme.dayHead}">
                            <time
                                datetime="{toISOString(date, 10)}"
                                aria-label="{$_intlDayHeaderAL.format(date)}"
                                use:setContent={$_intlDayHeader.format(date)}
                            ></time>
                        </div>
                        <div class="{$theme.times}">
                            {#each $_dayTimes[date.getTime()] as time}
                                <div class="{$theme.time}" role="columnheader">
                                    <time
                                        datetime="{time[0]}"
                                        use:setContent={time[1]}
                                    ></time>
                                </div>
                            {/each}
                        </div>
                </div>
            {/each}
        {:else}
            {#each $_weekDays as week}
                <div class="{$theme.day}">
                    <div class="{$theme.dayHead}">
                        T:{getWeekNumber(week)} - {$_intlMonthHeader.format(week)}
                    </div>
                    <div class="{$theme.times}">
                        {#each $_daysInWeek[week] as date}
                            <div class="{$theme.time}" role="columnheader">
                                <time
                                    datetime="{toISOString(date, 10)}"
                                    aria-label="{$_intlDayHeaderAL.format(date)}"
                                    use:setContent={$_intlDayHeader.format(date)}
                                ></time>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
    <div class="{$theme.hiddenScroll}"></div>
</div>
