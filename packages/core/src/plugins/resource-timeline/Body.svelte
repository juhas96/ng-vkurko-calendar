<script>
    import {getContext, tick, untrack} from 'svelte';
    import {observeResize, runReposition, nextDate, prevDate} from '#lib';
    import Days from './Days.svelte';

    let {_bodyEl, _headerEl, _events, _sidebarEl, monthsChanged, _dayTimes, _resHs, _viewResources, _viewDates,
        _recheckScrollable, date, duration, hiddenDays,slotWidth, theme, timelineScrollDirection} = getContext('state');

    let el = $state();
    let refs = [];
    let running = false;
    let hasScrolledRight = false;

    function isRunning() {
        return running;
    }

    $effect(() => {
        $_bodyEl = el;
    });

    function reposition() {
        $_resHs.clear();
        runReposition(refs, $_viewResources);
    }
    $effect(() => {
        $_events;
        $_viewResources;
        untrack(reposition);
    });


    $effect(() => {
        if ($timelineScrollDirection === 'next') {
            date.update(d => nextDate(d, {...$duration, months: 1}));
            timelineScrollDirection.set(undefined);
            $monthsChanged?.();
        } else if ($timelineScrollDirection === 'previous') {
            date.update(d => prevDate(d, {...$duration, months: 1}, $hiddenDays));
            timelineScrollDirection.set(undefined);
            $monthsChanged?.();
        }
    });


    async function handleScroll() {
        $_headerEl.scrollLeft = $_bodyEl.scrollLeft;
        $_sidebarEl.scrollTop = $_bodyEl.scrollTop;
        if (isRunning()) return;


        const threshold = 2;
        const maxScrollLeft = $_bodyEl.scrollWidth - $_bodyEl.clientWidth;

        if ($_bodyEl.scrollLeft >= maxScrollLeft - threshold) {
            hasScrolledRight = true;
            running = true;
            $_bodyEl.scrollLeft = $_bodyEl.scrollLeft - ($slotWidth * 30);
            timelineScrollDirection.set('next');
            await tick();
            running = false;
        }
        else if ($_bodyEl.scrollLeft <= threshold) {
            if (hasScrolledRight) {
                running = true;
                $_bodyEl.scrollLeft = $_bodyEl.scrollLeft + ($slotWidth * 30);
                timelineScrollDirection.set('previous');
                await tick();
                running = false;
            }
        }
        else {
            hasScrolledRight = true;
            timelineScrollDirection.set(undefined);
        }

    }
</script>

<div
    bind:this={el}
    class="{$theme.body}"
    onscroll={handleScroll}
    use:observeResize={() => $_recheckScrollable = true}
>
    <div class="{$theme.content}">
        <div class="{$theme.lines}">
            {#each $_viewDates as date}
                {#each $_dayTimes[date.getTime()] as time}
                    <div class="{$theme.line}"></div>
                {/each}
            {/each}
        </div>
        {#each $_viewResources as resource, i}
            <!-- svelte-ignore binding_property_non_reactive -->
            <Days {resource} bind:this={refs[i]}/>
        {/each}
    </div>
</div>

<svelte:window on:resize={reposition}/>
