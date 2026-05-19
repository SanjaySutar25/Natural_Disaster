// ============================================================
// DisasterLens India — Main Script
// ============================================================

let allData = [];
let stateChart1 = null, stateChart2 = null, stateChart3 = null;
let topStatesChart = null, disasterTypeChart = null, trendChart = null;
let indiaMap = null, geoLayer = null;

const DISASTER_ICONS = {
  Flood:'🌊', Cyclone:'🌀', Earthquake:'🌍', Drought:'☀️',
  Heatwave:'🌡️', Landslide:'⛰️', Snowstorm:'❄️', Erosion:'🏜️', Other:'⚠️'
};

const DISASTER_COLORS = [
  '#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b',
  '#ef4444','#ec4899','#14b8a6','#f97316','#6366f1'
];

const TIPS = {
  Flood:[
    {icon:'🎒',text:'Keep emergency kits ready with food, water, torch, and medicines for 72 hours.'},
    {icon:'📄',text:'Store important documents in waterproof bags or digital backups.'},
    {icon:'🚗',text:'Avoid driving through flooded roads — 6 inches of water can knock you down.'},
    {icon:'🗺️',text:'Know your nearest evacuation routes and community shelters.'},
    {icon:'📻',text:'Keep a battery-powered radio to receive emergency alerts.'},
    {icon:'🔌',text:'Turn off electricity at the main switch if flooding is imminent.'}
  ],
  Cyclone:[
    {icon:'🏠',text:'Reinforce doors, windows, and roof before cyclone season.'},
    {icon:'📲',text:'Follow IMD warnings and evacuation orders immediately.'},
    {icon:'🌳',text:'Stay away from windows and trees during the storm.'},
    {icon:'⛽',text:'Keep fuel tanks full and vehicles ready for evacuation.'},
    {icon:'🥫',text:'Stock non-perishable food and at least 10 liters of clean water.'},
    {icon:'📋',text:'Register with local disaster authority if you live in a coastal area.'}
  ],
  Earthquake:[
    {icon:'🛡️',text:'Drop, Cover, and Hold On — get under a sturdy table or desk.'},
    {icon:'🚪',text:'Stay away from windows, outside walls, and hanging objects.'},
    {icon:'🏗️',text:'After shaking stops, check for gas leaks and structural damage.'},
    {icon:'📦',text:'Keep an emergency kit including first aid, water, and flashlight.'},
    {icon:'🗺️',text:'Identify safe spots in every room — away from bookcases and heavy furniture.'},
    {icon:'📞',text:'Know how to shut off gas, water, and electricity at home.'}
  ],
  Drought:[
    {icon:'💧',text:'Harvest rainwater and store in clean, covered containers.'},
    {icon:'🌾',text:'Shift to drought-resistant crops and traditional seed varieties.'},
    {icon:'🪣',text:'Conserve water — fix leaks, use drip irrigation.'},
    {icon:'🏦',text:'Contact nearest government relief centers for food/water assistance.'},
    {icon:'👨‍🌾',text:'Farmers: enroll in crop insurance schemes before the season.'},
    {icon:'🌡️',text:'Prevent heat-related illness — stay hydrated and avoid midday sun.'}
  ],
  Heatwave:[
    {icon:'💧',text:'Drink at least 2–3 liters of water daily even if not thirsty.'},
    {icon:'👕',text:'Wear light-colored, loose, cotton clothes and use a hat/umbrella.'},
    {icon:'🌡️',text:'Avoid going out between 11 AM – 4 PM during heatwave alerts.'},
    {icon:'🏠',text:'Use damp curtains and keep rooms cool with cross-ventilation.'},
    {icon:'👴',text:'Check on elderly, children, and outdoor workers regularly.'},
    {icon:'🚑',text:'Know heat stroke signs: hot dry skin, confusion — call 108 immediately.'}
  ],
  Landslide:[
    {icon:'📻',text:'Monitor IMD alerts during heavy monsoon — evacuate early.'},
    {icon:'🏡',text:'Avoid building homes near steep slopes or riverbanks.'},
    {icon:'🌳',text:'Plant trees on slopes — roots prevent soil erosion.'},
    {icon:'🚶',text:'Evacuate uphill immediately if you hear rumbling sounds.'},
    {icon:'🔦',text:'Keep torches, rope, and first aid ready during monsoon season.'},
    {icon:'📞',text:'Report cracks in hillsides or roads to local authorities promptly.'}
  ],
  Snowstorm:[
    {icon:'🧣',text:'Layer clothing to prevent hypothermia — wool is best.'},
    {icon:'🏠',text:'Stock food, fuel, and medicines for at least 5 days.'},
    {icon:'🚗',text:'Avoid travel during snowstorm warnings; keep car emergency kit.'},
    {icon:'🔥',text:'Use safe indoor heating — never use open charcoal burners indoors.'},
    {icon:'📻',text:'Keep a battery radio for emergency broadcasts.'},
    {icon:'❄️',text:'Check roof structure for snow load and clear regularly.'}
  ],
  Erosion:[
    {icon:'🌱',text:'Plant vegetation along riverbanks to reduce erosion.'},
    {icon:'🏗️',text:'Support local embankment and retaining wall maintenance.'},
    {icon:'📋',text:'Register with NDMA for early-warning SMS alerts.'},
    {icon:'🏠',text:'Relocate from severely erosion-prone river islands (chars).'},
    {icon:'📸',text:'Document land changes and report to district officials.'},
    {icon:'💼',text:'Diversify income — avoid sole dependence on eroding farmland.'}
  ]
};

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
  showLoader(true);
  try {
    allData = window.DISASTER_DATA || [];
    populateSelects();
    populateHeroStats();
    buildNationalDashboard();
    initMap();
    setupEventListeners();
    setupParticles();
  } catch (e) {
    showToast('⚠️ Could not load disaster data. Please refresh.', 'error');
    console.error(e);
  } finally {
    showLoader(false);
  }
});

function showLoader(show) {
  document.getElementById('loader').classList.toggle('hidden', !show);
}

// ============================================================
// POPULATE SELECTS
// ============================================================
function populateSelects() {
  const states = [...new Set(allData.map(d => d.state))].sort();
  ['stateSelect','stateSelectInline'].forEach(id => {
    const sel = document.getElementById(id);
    states.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
  });
  // search dropdown
  const input = document.getElementById('stateSearch');
  const dd = document.getElementById('searchDropdown');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    dd.innerHTML = '';
    if (!q) { dd.classList.add('hidden'); return; }
    const matches = states.filter(s => s.toLowerCase().includes(q));
    if (!matches.length) { dd.classList.add('hidden'); return; }
    matches.forEach(s => {
      const div = document.createElement('div');
      div.className = 'dropdown-item';
      div.textContent = s;
      div.addEventListener('click', () => {
        input.value = s;
        document.getElementById('stateSelect').value = s;
        dd.classList.add('hidden');
      });
      dd.appendChild(div);
    });
    dd.classList.remove('hidden');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper')) dd.classList.add('hidden');
  });
}

// ============================================================
// HERO STATS
// ============================================================
function populateHeroStats() {
  const total = allData.length;
  const states = new Set(allData.map(d => d.state)).size;
  const deaths = allData.reduce((a,b) => a + b.deaths, 0);
  const affected = allData.reduce((a,b) => a + b.affected, 0);
  animateNumber('stat-total', total, '');
  animateNumber('stat-states', states, '');
  animateNumber('stat-deaths', deaths, '');
  animateNumber('stat-affected', affected, '');
}

function animateNumber(parentId, target, suffix) {
  const el = document.querySelector(`#${parentId} .stat-num`);
  if (!el) return;
  let start = 0;
  const duration = 1200;
  const step = timestamp => {
    if (!step.startTime) step.startTime = timestamp;
    const prog = Math.min((timestamp - step.startTime) / duration, 1);
    const val = Math.floor(prog * target);
    el.textContent = formatNum(val) + suffix;
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = formatNum(target) + suffix;
  };
  requestAnimationFrame(step);
}

function formatNum(n) {
  if (n >= 1e7) return (n/1e7).toFixed(1) + 'Cr';
  if (n >= 1e5) return (n/1e5).toFixed(1) + 'L';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return n.toLocaleString('en-IN');
}

// ============================================================
// NATIONAL DASHBOARD
// ============================================================
function buildNationalDashboard() {
  buildKPIs();
  buildTopStatesChart();
  buildDisasterTypeChart();
  buildTrendChart();
}

function buildKPIs() {
  const deaths = allData.reduce((a,b) => a + b.deaths, 0);
  const affected = allData.reduce((a,b) => a + b.affected, 0);
  const types = [...new Set(allData.map(d => d.disaster))].length;
  const years = [...new Set(allData.map(d => d.year))];
  const span = Math.max(...years) - Math.min(...years);
  const topState = getTopState();
  const kpis = [
    {icon:'📋',val:allData.length,label:'Total Records',sub:'across all states'},
    {icon:'💀',val:deaths,label:'Total Deaths',sub:'recorded fatalities'},
    {icon:'👥',val:affected,label:'People Affected',sub:'cumulative impact'},
    {icon:'🌪️',val:types,label:'Disaster Types',sub:'unique categories'},
    {icon:'📅',val:span+' yrs',label:'Data Span',sub:`${Math.min(...years)}–${Math.max(...years)}`,raw:true},
    {icon:'🏴',val:topState.state,label:'Most Affected State',sub:`${topState.deaths.toLocaleString()} deaths`,raw:true}
  ];
  const grid = document.getElementById('kpiGrid');
  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <span class="kpi-icon">${k.icon}</span>
      <div class="kpi-value">${k.raw ? k.val : formatNum(k.val)}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join('');
}

function getTopState() {
  const map = {};
  allData.forEach(d => {
    if (!map[d.state]) map[d.state] = 0;
    map[d.state] += d.deaths;
  });
  const top = Object.entries(map).sort((a,b) => b[1]-a[1])[0];
  return {state: top[0], deaths: top[1]};
}

function buildTopStatesChart() {
  const map = {};
  allData.forEach(d => {
    if (!map[d.state]) map[d.state] = 0;
    map[d.state] += d.deaths;
  });
  const sorted = Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,10);
  const ctx = document.getElementById('topStatesChart').getContext('2d');
  if (topStatesChart) topStatesChart.destroy();
  topStatesChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels: sorted.map(x=>x[0]),
      datasets:[{
        label:'Total Deaths',
        data: sorted.map(x=>x[1]),
        backgroundColor: DISASTER_COLORS,
        borderRadius:6, borderSkipped:false
      }]
    },
    options: chartOpts('Total Deaths by State')
  });
}

function buildDisasterTypeChart() {
  const map = {};
  allData.forEach(d => {
    if (!map[d.disaster]) map[d.disaster] = 0;
    map[d.disaster]++;
  });
  const sorted = Object.entries(map).sort((a,b) => b[1]-a[1]);
  const ctx = document.getElementById('disasterTypeChart').getContext('2d');
  if (disasterTypeChart) disasterTypeChart.destroy();
  disasterTypeChart = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels: sorted.map(x=>x[0]),
      datasets:[{
        data: sorted.map(x=>x[1]),
        backgroundColor: DISASTER_COLORS,
        borderWidth: 2,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card') || '#1c2230'
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:'right',labels:{color:getTextColor(),font:{family:'Inter',size:11},padding:12}},
        tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw} events`}}
      },
      cutout:'65%'
    }
  });
}

function buildTrendChart() {
  const map = {};
  allData.forEach(d => {
    if (!map[d.year]) map[d.year] = {events:0,deaths:0};
    map[d.year].events++;
    map[d.year].deaths += d.deaths;
  });
  const years = Object.keys(map).sort();
  const ctx = document.getElementById('trendChart').getContext('2d');
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type:'line',
    data:{
      labels: years,
      datasets:[
        {label:'Events',data:years.map(y=>map[y].events),borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.12)',fill:true,tension:.4,pointRadius:4,pointHoverRadius:7},
        {label:'Deaths',data:years.map(y=>map[y].deaths),borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,.08)',fill:true,tension:.4,pointRadius:4,pointHoverRadius:7,yAxisID:'y2'}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{legend:{labels:{color:getTextColor(),font:{family:'Inter',size:11}}}},
      scales:{
        x:{ticks:{color:getTextColor(),font:{family:'Inter',size:10}},grid:{color:'rgba(255,255,255,.05)'}},
        y:{ticks:{color:getTextColor(),font:{family:'Inter',size:10}},grid:{color:'rgba(255,255,255,.05)'},title:{display:true,text:'Events',color:getTextColor()}},
        y2:{position:'right',ticks:{color:'#ef4444',font:{family:'Inter',size:10}},grid:{display:false},title:{display:true,text:'Deaths',color:'#ef4444'}}
      }
    }
  });
}

function chartOpts(title) {
  return {
    responsive:true,maintainAspectRatio:false,indexAxis:'y',
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.raw.toLocaleString('en-IN')}`}}},
    scales:{
      x:{ticks:{color:getTextColor(),font:{family:'Inter',size:10}},grid:{color:'rgba(255,255,255,.05)'}},
      y:{ticks:{color:getTextColor(),font:{family:'Inter',size:10}},grid:{display:false}}
    }
  };
}

function getTextColor() {
  return document.documentElement.getAttribute('data-theme')==='light' ? '#475569' : '#8b949e';
}

// ============================================================
// STATE ANALYSIS
// ============================================================
function analyzeState(state) {
  if (!state) { showToast('Please select a state first!'); return; }
  const data = allData.filter(d => d.state === state);
  if (!data.length) { showToast('No data found for this state.'); return; }

  // counts per disaster type
  const counts = {};
  data.forEach(d => { counts[d.disaster] = (counts[d.disaster]||0)+1; });
  const total = data.length;
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const topDisaster = sorted[0][0];
  const pcts = sorted.map(([k,v])=>({type:k, count:v, pct:((v/total)*100).toFixed(1)}));

  showAlertCard(state, topDisaster, data);
  showPercentageCards(pcts);
  buildStatePieChart(pcts, state);
  buildStateBarChart(pcts, state);
  buildStateTimeline(data, state);
  buildDataTable(data, state);
  showTips(topDisaster);
  highlightMapState(state);

  // scroll to analysis
  document.getElementById('analysis').scrollIntoView({behavior:'smooth'});
  showToast(`✅ Analysis ready for ${state}`);
}

function showAlertCard(state, topDisaster, data) {
  const card = document.getElementById('alertCard');
  const totalDeaths = data.reduce((a,b)=>a+b.deaths,0);
  const totalAffected = data.reduce((a,b)=>a+b.affected,0);
  document.getElementById('alertIcon').textContent = DISASTER_ICONS[topDisaster]||'⚠️';
  document.getElementById('alertTitle').textContent = `Most Common Disaster in ${state}: ${topDisaster}`;
  document.getElementById('alertSub').textContent =
    `${data.length} recorded events · ${totalDeaths.toLocaleString('en-IN')} deaths · ${formatNum(totalAffected)} affected`;
  card.classList.remove('hidden');
  document.getElementById('pieChartTitle').textContent = `${state} — Disaster Distribution`;
  document.getElementById('barChartTitle').textContent = `${state} — Occurrence by Type`;
  document.getElementById('timelineTitle').textContent = `${state} — Year-wise Deaths`;
  document.getElementById('tableTitle').textContent = `${state} — All Records`;
}

function showPercentageCards(pcts) {
  const container = document.getElementById('percentageCards');
  container.innerHTML = pcts.map(p=>`
    <div class="perc-card">
      <div class="perc-card-icon">${DISASTER_ICONS[p.type]||'⚠️'}</div>
      <div class="perc-card-type">${p.type}</div>
      <div class="perc-card-value">${p.pct}%</div>
      <div class="perc-bar"><div class="perc-bar-fill" style="width:${p.pct}%"></div></div>
    </div>`).join('');
  container.classList.remove('hidden');
}

function buildStatePieChart(pcts, state) {
  const ctx = document.getElementById('statePieChart').getContext('2d');
  if (stateChart1) stateChart1.destroy();
  stateChart1 = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels: pcts.map(p=>p.type),
      datasets:[{
        data: pcts.map(p=>p.pct),
        backgroundColor: DISASTER_COLORS,
        borderWidth:2,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card')||'#1c2230'
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'bottom',labels:{color:getTextColor(),font:{family:'Inter',size:11},padding:10}},
        tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw}%`}}
      },
      cutout:'60%'
    }
  });
}

function buildStateBarChart(pcts, state) {
  const ctx = document.getElementById('stateBarChart').getContext('2d');
  if (stateChart2) stateChart2.destroy();
  stateChart2 = new Chart(ctx, {
    type:'bar',
    data:{
      labels: pcts.map(p=>p.type),
      datasets:[{
        label:'Occurrences',
        data: pcts.map(p=>parseInt(p.count)),
        backgroundColor: DISASTER_COLORS,
        borderRadius:6, borderSkipped:false
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{color:getTextColor(),font:{family:'Inter',size:10}},grid:{display:false}},
        y:{ticks:{color:getTextColor(),font:{family:'Inter',size:10},stepSize:1},grid:{color:'rgba(255,255,255,.05)'}}
      }
    }
  });
}

function buildStateTimeline(data, state) {
  const byYear = {};
  data.forEach(d=>{
    if (!byYear[d.year]) byYear[d.year]={deaths:0,affected:0,events:0};
    byYear[d.year].deaths+=d.deaths;
    byYear[d.year].affected+=d.affected;
    byYear[d.year].events++;
  });
  const years = Object.keys(byYear).sort();
  const ctx = document.getElementById('stateTimelineChart').getContext('2d');
  if (stateChart3) stateChart3.destroy();
  stateChart3 = new Chart(ctx, {
    type:'line',
    data:{
      labels:years,
      datasets:[
        {label:'Deaths',data:years.map(y=>byYear[y].deaths),borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,.1)',fill:true,tension:.4,pointRadius:5,pointHoverRadius:8},
        {label:'Events',data:years.map(y=>byYear[y].events),borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.08)',fill:true,tension:.4,pointRadius:5,pointHoverRadius:8,yAxisID:'y2'}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{legend:{labels:{color:getTextColor(),font:{family:'Inter',size:11}}}},
      scales:{
        x:{ticks:{color:getTextColor(),font:{family:'Inter',size:10}},grid:{color:'rgba(255,255,255,.05)'}},
        y:{ticks:{color:getTextColor(),font:{family:'Inter',size:10}},grid:{color:'rgba(255,255,255,.05)'},title:{display:true,text:'Deaths',color:'#ef4444'}},
        y2:{position:'right',ticks:{color:'#3b82f6',font:{family:'Inter',size:10}},grid:{display:false},title:{display:true,text:'Events',color:'#3b82f6'}}
      }
    }
  });
}

function buildDataTable(data, state) {
  const sorted = [...data].sort((a,b)=>b.year-a.year);
  renderTable(sorted);
  document.getElementById('tableSearch').addEventListener('input', function(){
    const q = this.value.toLowerCase();
    renderTable(sorted.filter(d=>
      String(d.year).includes(q)||d.disaster.toLowerCase().includes(q)
    ));
  });
}

function renderTable(rows) {
  document.getElementById('tableBody').innerHTML = rows.map(r=>`
    <tr>
      <td>${r.year}</td>
      <td>${DISASTER_ICONS[r.disaster]||''} ${r.disaster}</td>
      <td style="color:#ef4444;font-weight:600">${r.deaths.toLocaleString('en-IN')}</td>
      <td>${formatNum(r.affected)}</td>
    </tr>`).join('');
}

// ============================================================
// TIPS
// ============================================================
function showTips(topDisaster) {
  const tabsEl = document.getElementById('tipsTabs');
  const contentEl = document.getElementById('tipsContent');
  const disasters = Object.keys(TIPS);
  tabsEl.innerHTML = disasters.map(d=>`
    <button class="tips-tab${d===topDisaster?' active':''}" data-disaster="${d}">
      ${DISASTER_ICONS[d]||'⚠️'} ${d}
    </button>`).join('');
  renderTips(topDisaster, contentEl);
  tabsEl.querySelectorAll('.tips-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      tabsEl.querySelectorAll('.tips-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderTips(btn.dataset.disaster, contentEl);
    });
  });
  document.getElementById('tips-section').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function renderTips(disaster, container) {
  const tips = TIPS[disaster] || [{icon:'ℹ️',text:'General preparedness: keep emergency kits, stay informed via official channels.'}];
  container.innerHTML = `
    <div class="tips-header">
      <h3>${DISASTER_ICONS[disaster]||'⚠️'} ${disaster} Preparedness</h3>
      <p>Evidence-based tips to help you stay safe before, during, and after a ${disaster.toLowerCase()}.</p>
    </div>
    <div class="tips-grid">${tips.map(t=>`
      <div class="tip-card">
        <span class="tip-icon">${t.icon}</span>
        <span class="tip-text">${t.text}</span>
      </div>`).join('')}</div>`;
}

// ============================================================
// LEAFLET MAP
// ============================================================
async function initMap() {
  indiaMap = L.map('map', {
    center:[22.5,82.5], zoom:4.5,
    zoomControl:true, attributionControl:false
  });

  // Tile layer (OpenStreetMap — dark style)
  const isDark = document.documentElement.getAttribute('data-theme')==='dark';
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
  L.tileLayer(tileUrl, {maxZoom:10}).addTo(indiaMap);

  try {
    const res = await fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson');
    const geojson = await res.json();
    addGeoLayer(geojson);
    buildMapLegend();
  } catch(e) {
    document.getElementById('map').innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text2);flex-direction:column;gap:1rem"><span style="font-size:3rem">🗺️</span><p>Map unavailable offline — please connect to the internet</p></div>';
  }
}

function getStateRisk(stateName) {
  const match = allData.filter(d => normalize(d.state) === normalize(stateName));
  const deaths = match.reduce((a,b)=>a+b.deaths,0);
  if (deaths > 5000) return {level:'Critical',color:'#ef4444'};
  if (deaths > 1000) return {level:'High',color:'#f97316'};
  if (deaths > 300)  return {level:'Medium',color:'#f59e0b'};
  if (deaths > 50)   return {level:'Low',color:'#3b82f6'};
  return {level:'Minimal',color:'#10b981'};
}

function normalize(s){ return s.toLowerCase().replace(/[\s&]/g,''); }

function addGeoLayer(geojson) {
  geoLayer = L.geoJSON(geojson, {
    style: feature => {
      const name = feature.properties.NAME_1 || feature.properties.st_nm || '';
      const risk = getStateRisk(name);
      return {fillColor:risk.color,weight:1,color:'rgba(255,255,255,.2)',fillOpacity:.65};
    },
    onEachFeature: (feature, layer) => {
      const name = feature.properties.NAME_1 || feature.properties.st_nm || '';
      const stateData = allData.filter(d => normalize(d.state)===normalize(name));
      const deaths = stateData.reduce((a,b)=>a+b.deaths,0);
      const topD = getTopDisaster(stateData);
      layer.on({
        mouseover(e){
          e.target.setStyle({weight:2,color:'#fff',fillOpacity:.9});
          updateMapInfo(name, stateData.length, deaths, topD);
        },
        mouseout(e){
          geoLayer.resetStyle(e.target);
          document.getElementById('mapInfoBox').innerHTML =
            '<p class="map-info-placeholder">👆 Click a state on the map to see details</p>';
        },
        click(){ analyzeState(findState(name)); }
      });
    }
  }).addTo(indiaMap);
}

function findState(geoName) {
  const states = [...new Set(allData.map(d=>d.state))];
  return states.find(s => normalize(s)===normalize(geoName)) || geoName;
}

function getTopDisaster(data) {
  if (!data.length) return 'N/A';
  const map={};
  data.forEach(d=>{map[d.disaster]=(map[d.disaster]||0)+1;});
  return Object.entries(map).sort((a,b)=>b[1]-a[1])[0][0];
}

function updateMapInfo(name, events, deaths, topD) {
  document.getElementById('mapInfoBox').innerHTML = `
    <div class="map-state-name">${name}</div>
    <div class="map-stat">📋 Events: <strong>${events}</strong></div>
    <div class="map-stat">💀 Deaths: <strong>${deaths.toLocaleString('en-IN')}</strong></div>
    <div class="map-stat">⚠️ Top Disaster: <span class="map-highlight">${topD}</span></div>`;
}

function highlightMapState(state) {
  if (!geoLayer) return;
  geoLayer.eachLayer(layer => {
    const name = layer.feature?.properties?.NAME_1 || layer.feature?.properties?.st_nm || '';
    if (normalize(name) === normalize(state)) {
      layer.setStyle({weight:3,color:'#fff',fillOpacity:1});
      indiaMap.flyToBounds(layer.getBounds(), {padding:[40,40],duration:1});
    }
  });
}

function buildMapLegend() {
  const levels = [
    {level:'Critical (>5000 deaths)',color:'#ef4444'},
    {level:'High (1001–5000)',color:'#f97316'},
    {level:'Medium (301–1000)',color:'#f59e0b'},
    {level:'Low (51–300)',color:'#3b82f6'},
    {level:'Minimal (≤50)',color:'#10b981'}
  ];
  document.getElementById('legendItems').innerHTML = levels.map(l=>`
    <div class="legend-item">
      <div class="legend-color" style="background:${l.color}"></div>
      <span>${l.level}</span>
    </div>`).join('');
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  document.getElementById('analyzeBtn').addEventListener('click',()=>{
    const v = document.getElementById('stateSelect').value ||
              document.getElementById('stateSearch').value.trim();
    analyzeState(v);
  });
  document.getElementById('analyzeBtnInline').addEventListener('click',()=>{
    analyzeState(document.getElementById('stateSelectInline').value);
  });
  document.getElementById('stateSelect').addEventListener('change', e=>{
    document.getElementById('stateSearch').value = e.target.value;
    document.getElementById('stateSelectInline').value = e.target.value;
  });
  document.getElementById('stateSelectInline').addEventListener('change', e=>{
    document.getElementById('stateSelect').value = e.target.value;
    document.getElementById('stateSearch').value = e.target.value;
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click',()=>{
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme')==='dark';
    html.setAttribute('data-theme', isDark?'light':'dark');
    document.getElementById('themeIcon').textContent = isDark?'🌙':'☀️';
    showToast(isDark?'Light mode on ☀️':'Dark mode on 🌙');
  });

  // Hamburger
  document.getElementById('hamburger').addEventListener('click',()=>{
    document.getElementById('navLinks').classList.toggle('open');
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[data-section="${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  },{threshold:.3});
  sections.forEach(s=>observer.observe(s));

  // Download report
  document.getElementById('downloadReport').addEventListener('click', downloadReport);
}

// ============================================================
// DOWNLOAD REPORT
// ============================================================
function downloadReport() {
  const title = document.getElementById('alertTitle').textContent;
  if (title==='—') { showToast('Analyze a state first!'); return; }
  const rows = document.querySelectorAll('#tableBody tr');
  let csv = 'Year,Disaster,Deaths,Affected\n';
  rows.forEach(r=>{
    const cells = r.querySelectorAll('td');
    csv += `${cells[0].textContent},${cells[1].textContent.trim()},${cells[2].textContent},${cells[3].textContent}\n`;
  });
  const blob = new Blob([`${title}\n\n${csv}`], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=`disaster-report-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Report downloaded!');
}

// ============================================================
// PARTICLES
// ============================================================
function setupParticles() {
  const container = document.getElementById('heroParticles');
  for (let i=0;i<30;i++){
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      width:${Math.random()*4+2}px;height:${Math.random()*4+2}px;
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      background:rgba(${Math.random()>0.5?'59,130,246':'139,92,246'},${Math.random()*.4+.1});
      animation:floatParticle ${Math.random()*8+6}s ease-in-out infinite;
      animation-delay:${Math.random()*5}s;`;
    container.appendChild(p);
  }
  if (!document.getElementById('particleStyle')){
    const s = document.createElement('style');
    s.id='particleStyle';
    s.textContent = `@keyframes floatParticle{0%,100%{transform:translateY(0) scale(1);opacity:.4}50%{transform:translateY(-40px) scale(1.2);opacity:.9}}`;
    document.head.appendChild(s);
  }
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = type==='error'?'#ef4444':'var(--accent)';
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.add('hidden'),3200);
}

