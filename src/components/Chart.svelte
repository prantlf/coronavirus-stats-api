<script>
	export let segment;

	function onMount () {
    const chart = new Chartist.Line('#chart', {
      labels,
      series
    }, {
      chartPadding: { bottom: 30, right: 50 },
      fullWidth: true,
      // showPoint: false,
      lineSmooth: Chartist.Interpolation.cardinal({ fillHoles: true }),
      axisX: {
        labelInterpolationFnc: value => {
          return value === '' ? formatDate(endDate)
            : value.endsWith('\n0:00')
              ? value.slice(0, value.length - 5) : ''
        }
      },
      axisY: {
        labelInterpolationFnc: value => Math.round(value / 1000)
      },
      plugins: [
        Chartist.plugins.legend({
          position: 'bottom',
          classNames: columns.slice(2)
        }),
        Chartist.plugins.ctAxisTitle({
          axisX: {
            axisTitle: 'Day',
            offset: { x: 0, y: 50 },
            textAnchor: 'middle'
          },
          axisY: {
            axisTitle: 'Cases [thousands]',
            offset: { x: 0, y: 0 },
            textAnchor: 'middle'
          }
        }),
        Chartist.plugins.tooltip({
          tooltipFnc: (label, value) => `${label}: ${Math.round(value / 1000)}`,
          appendToBody: true
        }),
        Chartist.plugins.ctAccessibility({
          caption: 'Development in a Week',
          seriesHeader: 'Time/Cases',
          summary: 'Hourly Statistics of Coronavirus 19',
          valueTransform: value => value !== undefined ? formatNumber(value) : '',
          visuallyHiddenStyles: 'font-size: var(--smaller-text-size); overflow-x: auto; background-color: rgba(0, 0, 0, .05); padding: 10px;'
        })
      ]
    })
	}
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav>
	<ul>
		<li><a aria-current='{segment === undefined ? "page" : undefined}' href='.'>Overview</a></li>
		<li><a aria-current='{segment === "charts" ? "page" : undefined}' href='charts'>Charts</a></li>
		<li><a aria-current='{segment === "tables" ? "page" : undefined}' href='tables'>Tables</a></li>
		<li><a aria-current='{segment === "sources" ? "page" : undefined}' href='sources'>Sources</a></li>

		<!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
		<li><a rel=prefetch aria-current='{segment === "blog" ? "page" : undefined}' href='blog'>blog</a></li>
	</ul>
</nav>
