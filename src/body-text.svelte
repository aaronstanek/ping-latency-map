<script>
	import Anchor from '$lib/links/anchor.svelte';
	import Link from '$lib/links/link.svelte';

	import Cite from '$lib/citations/cite.svelte';
	import Bibliography from '$lib/citations/bibliography.svelte';
	import { compileCitations } from '$lib/citations/compile';

	const cite = compileCitations({
		wondernetworkPings: {
			title: 'Global Ping Statistics',
			accessed: '30 Apr 2024',
			author: 'WonderNetwork',
			url: 'https://wondernetwork.com/pings'
		},
		'1to3Seconds': {
			title: 'Page load time statistics',
			accessed: '14 Aug 2024',
			author: 'Google',
			url: 'https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/page-load-time-statistics/'
		},
		abandonAt3Seconds: {
			title: 'Mobile site load time statistics',
			accessed: '14 Aug 2024',
			author: 'Google',
			url: 'https://www.thinkwithgoogle.com/consumer-insights/consumer-trends/mobile-site-load-time-statistics/'
		},
		ultimateInfographic: {
			title: 'The ultimate mobile page speed infographic',
			accessed: '14 Aug 2024',
			author: 'Google',
			url: 'https://blog.google/products/adsense/the-ultimate-mobile-page-speed-infographic/'
		},
		isMyConnectionGood: {
			title: 'What Are Good Latency & Ping Speeds?',
			accessed: '14 Aug 2024',
			author: 'Pingman Tools',
			url: 'https://www.pingplotter.com/wisdom/article/is-my-connection-good/'
		},
		nielsen: {
			title: 'Response Times: The 3 Important Limits',
			accessed: '14 Aug 2024',
			author: 'Nielsen, Jakob',
			url: 'https://www.nngroup.com/articles/response-times-3-important-limits/'
		}
	});
</script>

<Anchor name="contents"><h3 class="mt-6">Table of Contents</h3></Anchor>

<div class="mt-1">
	1. <Link href="#how-to">How to Use This Tool</Link><br />
	2. <Link href="#map">The Map</Link><br />
	3. <Link href="#understanding">Understanding Ping Latency</Link><br />
	4. <Link href="#impact">The Impact of Latency on User Experience</Link><br />
	5. <Link href="#disclaimer">Disclaimer</Link><br />
	6. <Link href="#credits">Credits</Link><br />
	7. <Link href="#source-code">Source Code</Link><br />
	8. <Link href="#bibliography">Bibliography</Link>
</div>

<Anchor name="understanding"><h3 class="mt-6">Understanding Ping Latency</h3></Anchor>

<div class="mt-6">
	Ping latency measures the time it takes to send a piece of information to a computer on the
	internet and to receive a response back from that computer.
</div>

<div class="mt-6">
	Ping latency is roughly correlated with the physical distance between the sender and receiver of
	the ping. As a sense of scale, ping latency is usually measured in milliseconds (ms). A ping
	between two computers in the same metro area takes about 1ms. A ping between two computers in the
	same part of a continent typically takes about 20ms; for example, between New York and Chicago, or
	between London and Berlin. A ping between computers on opposite sides of the planet takes about
	300ms.<Cite ref={cite.get.wondernetworkPings} />
</div>

<Anchor name="impact"><h3 class="mt-6 mb-6">The Impact of Latency on User Experience</h3></Anchor>

<div class="mt-6">
	High ping latency translates to slow-loading websites and sluggish responses. This directly
	affects user satisfaction. Even slight increases in ping latency can significantly hurt website
	performance. The probability of a bounce increases 32% as page load time goes from 1 second to 3
	seconds.<Cite ref={cite.get['1to3Seconds']} /> 53% of visits are abandoned if a mobile site takes longer
	than 3 seconds to load.<Cite ref={[cite.get.abandonAt3Seconds, cite.get.ultimateInfographic]} />
</div>

<div class="mt-6">
	So, how much ping latency is acceptable for a modern website? There is no solid number, but
	generally aiming for a 50ms ping latency between a user's city and a webserver's city is a good
	benchmark. Taking this 50ms and adding another 50ms for the user's device to route through the
	local ISP and for the webserver to process the request gives a 100ms delay overall between the
	time a user clicks a button, and the time that the webpage responds.<Cite
		ref={cite.get.isMyConnectionGood}
	/> 100ms is the longest that a computer can take to respond where the user perceives the response to
	be instantaneous.<Cite ref={cite.get.nielsen} />
</div>

<Anchor name="disclaimer"><h3 class="mt-6">Disclaimer</h3></Anchor>

<div class="mt-6">
	This map is intended only as an approximate reference. The information on the map including, but
	not limited to, the ping latencies between specific cities, the locations of cities, and the
	locations of national borders may differ from the real world.
</div>

<Anchor name="credits"><h3 class="mt-6">Credits</h3></Anchor>

<div class="mt-6">
	The map data for this project is used under license from Wikimedia.
	<Link href="https://commons.wikimedia.org/wiki/File:Mercator_Projection.svg">Source</Link>
</div>
<div class="mt-6">
	The ping data for this project is used under license from WonderNetwork.
	<Link href="https://wonderproxy.com/blog/a-day-in-the-life-of-the-internet/">Source</Link>
</div>

<Anchor name="source-code"><h3 class="mt-6">Source Code</h3></Anchor>

<div class="mt-6">
	The source code for this project is <Link href="https://github.com/aaronstanek/ping-latency-map"
		>available on GitHub</Link
	>.
</div>

<Anchor name="bibliography"><h3 class="mt-6 mb-6">Bibliography</h3></Anchor>

<Bibliography highlightPipe={cite.highlightPipe} ordered={cite.ordered} />
