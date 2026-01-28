const titles = {
  dashboard: ['Dashboard', 'A quick command center for decisions.'],
  insights: ['Insights', 'Diagnostic feed with evidence and filters.'],
  'campaign-detail': ['Campaign Detail', 'Status, summary, and recent trend.'],
  'waste-detail': ['Waste Detail', 'Evidence + exact items + recommended changes.'],
  action: ['Action Plan', 'Turn insights into tasks and track progress.'],
  'task-guide': ['How to do it', 'Step-by-step instructions with copy/paste items.'],
  'task-apply': ['Apply for me', 'Approve changes to be applied and logged.'],
  'how-dina-works': ['How Dina Works', 'Learn how the system analyzes your account and identifies opportunities.']
};

// Parse hashes like: #task-guide&task=negatives_18
function parseHash(){
  const raw = (window.location.hash || '#dashboard').replace('#','');
  const parts = raw.split('&');
  const page = parts[0] || 'dashboard';
  const params = new URLSearchParams(parts.slice(1).join('&'));
  return { page, params };
}

function setActive(pageId){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(pageId);
  if(el) el.classList.add('active');

  document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll(`.nav a[data-nav="${pageId}"]`).forEach(a => a.classList.add('active'));

  const [t,d] = titles[pageId] || ['Dashboard',''];
  document.getElementById('pageTitle').textContent = t;
  document.getElementById('pageDesc').textContent = d;
}

function go(pageId, paramsObj){
  const params = new URLSearchParams(paramsObj || {});
  const suffix = params.toString() ? '&' + params.toString() : '';
  window.location.hash = '#' + pageId + suffix;
  hydrate();
}


// ----- Waste detail hydration (fake but meaningful) -----
const wasteDetailData = {
  term_what_is_filler: {
    title: 'Search term: "what is dermal filler"',
    summary: 'High clicks with zero leads. Intent is informational. Recommend blocking via phrase match negative to reduce wasted spend.',
    confidence: '0.86',
    impact: '$176 / 30d (and similar terms often cluster together)',
    rec: 'Add negative keyword (phrase)',
    recDetail: 'Add as phrase negative to stop research traffic while preserving high-intent “cost/clinic/near me” terms.',
    evidenceRows: [
      ['Core Services','Filler – Generic','3,210','94','$176','0','High clicks, zero leads. Landing path shows short sessions.']
    ],
    exactItems: [
      ['Negative list: Research','what is dermal filler','Phrase','Campaign: Core Services · Ad group: Filler – Generic'],
      ['Negative list: Research','filler side effects','Phrase','Campaign: Core Services · Ad group: Filler – Generic']
    ]
  },
  term_side_effects: {
    title: 'Search term: "filler side effects"',
    summary: 'Users are researching risks. Strong indicator of non-booking intent for this account.',
    confidence: '0.84',
    impact: '$142 / 30d',
    rec: 'Add negative keyword (phrase)',
    recDetail: 'Block side-effect research terms and redirect budget to “cost/appointment/clinic” themes.',
    evidenceRows: [
      ['Core Services','Filler – Generic','2,740','71','$142','0','Research intent cluster: side effects / safety / swelling.']
    ],
    exactItems: [
      ['Negative list: Research','filler side effects','Phrase','Campaign: Core Services · Ad group: Filler – Generic']
    ]
  },
  term_cheapest: {
    title: 'Search term: "cheapest botox near me"',
    summary: 'Price-shopping intent. Might be ok if you compete on price, otherwise tighten targeting.',
    confidence: '0.73',
    impact: '$119 / 30d',
    rec: 'Split intent + tighten match',
    recDetail: 'Create a separate ad group for price shoppers with capped budget, or add qualifiers (premium, best clinic).',
    evidenceRows: [
      ['Botox','Botox – Price','1,980','58','$119','1','Low lead rate. Leads tend to have low close rate (if CRM connected).']
    ],
    exactItems: [
      ['Ad group change','cheapest botox','—','Move to price-only ad group + cap budget']
    ]
  },
  term_before_after: {
    title: 'Search term: "before and after filler"',
    summary: 'Content consumption intent (images/videos). Usually wastes budget in lead-gen accounts.',
    confidence: '0.80',
    impact: '$203 / 30d',
    rec: 'Add negative keyword (exact)',
    recDetail: 'Block “before and after” phrase that attracts browsing traffic. Keep “cost/appointment” terms.',
    evidenceRows: [
      ['Core Services','Filler – Generic','2,890','63','$203','0','Many clicks, short sessions.']
    ],
    exactItems: [
      ['Negative list: Research','before and after filler','Exact','Campaign: Core Services · Ad group: Filler – Generic']
    ]
  },
  term_cost_dubai: {
    title: 'Search term: "lip filler cost dubai"',
    summary: 'High-intent term that performs well. Not waste. Use as a positive signal to scale.',
    confidence: '0.92',
    impact: '4 leads from $164',
    rec: 'Keep + consider scaling',
    recDetail: 'Create more exact/phrase variants and improve ad relevance for this cluster.',
    evidenceRows: [
      ['Core Services','Lip Filler','1,120','41','$164','4','Good CVR. Consider increasing rank / impression share.']
    ],
    exactItems: [
      ['No change','lip filler cost dubai','—','Keep active']
    ]
  },
  kw_filler_broad: {
    title: 'Keyword: filler (Broad)',
    summary: 'Broad match is pulling low-intent queries. Tighten match types and add negatives to reduce waste.',
    confidence: '0.75',
    impact: '$1,140 / 30d',
    rec: 'Switch to phrase/exact + add negatives',
    recDetail: 'Keep the broad keyword only if you have strong negatives and proven conversion signals.',
    evidenceRows: [
      ['Core Services','Filler – Generic','18,900','390','$1,140','7','High spend. Mixed intent. Many research terms observed.']
    ],
    exactItems: [
      ['Keyword edit','filler','—','Pause broad, add phrase/exact variants']
    ]
  },
  kw_botox_broad: {
    title: 'Keyword: botox (Broad)',
    summary: 'Broad expansion can be OK but must be controlled. Add qualifiers or split intent.',
    confidence: '0.70',
    impact: '$920 / 30d',
    rec: 'Add qualifiers + separate intent groups',
    recDetail: 'Create ad groups for “clinic/booking” vs “info/side effects” and block research terms.',
    evidenceRows: [
      ['Botox','Botox – Generic','15,200','280','$920','9','Reasonable, but leakage to research queries.']
    ],
    exactItems: [
      ['Structure','botox','—','Split to “booking” ad group + negatives']
    ]
  },
  loc_sharjah: {
    title: 'Location: Sharjah',
    summary: 'Spend without leads for this campaign/ad group pairing. Consider excluding or lowering bids.',
    confidence: '0.79',
    impact: '$290 / 30d',
    rec: 'Exclude location (test 14 days)',
    recDetail: 'Exclude Sharjah for Core Services/Filler group, then reassess lead volume.',
    evidenceRows: [
      ['Core Services','Filler – Generic','4,600','86','$290','0','Strong mismatch vs Dubai areas.']
    ],
    exactItems: [
      ['Location exclusion','Sharjah','—','Campaign: Core Services · Ad group: Filler – Generic']
    ]
  },
  loc_marina: {
    title: 'Location: Dubai Marina',
    summary: 'High-performing area. Not waste. Opportunity to increase bids modestly.',
    confidence: '0.83',
    impact: '6 leads from $248',
    rec: 'Increase bid adjustment +10%',
    recDetail: 'Apply a +10% location bid modifier and monitor CPL for 7–14 days.',
    evidenceRows: [
      ['Core Services','Lip Filler','2,020','64','$248','6','Strong performance relative to average.']
    ],
    exactItems: [
      ['Bid adjustment','Dubai Marina','+10%','Campaign: Core Services · Ad group: Lip Filler']
    ]
  },
  dev_mobile: {
    title: 'Device: Mobile',
    summary: 'Mobile spend is high. Leads exist, but tracking risk indicates potential under-counting of calls.',
    confidence: '0.72',
    impact: '$1,640 / 30d',
    rec: 'Verify call tracking + landing speed',
    recDetail: 'Fix call conversions and check mobile landing speed before cutting spend.',
    evidenceRows: [
      ['Core Services','Filler – Generic','22,500','520','$1,640','10','Mobile CTR high. Call conversions missing.']
    ],
    exactItems: [
      ['Tracking fix','Calls from Ads','—','Enable call conversion for mobile']
    ]
  },
  dev_desktop: {
    title: 'Device: Desktop',
    summary: 'Desktop performance is strong for this ad group. Not waste.',
    confidence: '0.88',
    impact: '9 leads from $410',
    rec: 'Keep',
    recDetail: 'No action required.',
    evidenceRows: [
      ['Core Services','Lip Filler','4,200','120','$410','9','High CVR.']
    ],
    exactItems: [
      ['No change','Desktop','—','Keep active']
    ]
  },
  time_0100_0600: {
    title: 'Schedule: 01:00–06:00',
    summary: 'Spend with zero leads during late-night hours. Usually low intent.',
    confidence: '0.81',
    impact: '$170 / 30d',
    rec: 'Reduce bids -30% or exclude',
    recDetail: 'Apply an ad schedule bid adjustment or pause ads in this window.',
    evidenceRows: [
      ['Core Services','Filler – Generic','1,300','98','$170','0','Clicks with no conversions.']
    ],
    exactItems: [
      ['Ad schedule','01:00–06:00','—','Reduce bids -30%']
    ]
  },
  time_1200_1800: {
    title: 'Schedule: 12:00–18:00',
    summary: 'Strong hours. Not waste. Keep or scale.',
    confidence: '0.85',
    impact: '8 leads from $240',
    rec: 'Keep',
    recDetail: 'No change required.',
    evidenceRows: [
      ['Core Services','Lip Filler','1,900','110','$240','8','Best-performing time window.']
    ],
    exactItems: [
      ['No change','12:00–18:00','—','Keep active']
    ]
  }
};

function hydrateWasteDetail(itemKey){
  const data = wasteDetailData[itemKey] || wasteDetailData.term_what_is_filler;
  const titleEl = document.getElementById('wasteDetailTitle');
  const summaryEl = document.getElementById('wasteDetailSummary');
  const metaEl = document.getElementById('wasteDetailMeta');
  const evBody = document.getElementById('wasteEvidenceBody');
  const recEl = document.getElementById('wasteRecommended');
  const recDet = document.getElementById('wasteChangeDetail');
  const exactBody = document.getElementById('wasteExactItems');

  if(titleEl) titleEl.textContent = data.title;
  if(summaryEl) summaryEl.textContent = data.summary;
  if(metaEl) metaEl.innerHTML = `
    <span class="tag">Type: Waste</span>
    <span class="tag">Confidence: ${data.confidence}</span>
    <span class="tag">Est. impact: ${data.impact}</span>
    <span class="tag">Source tab: ${(parseHash().params.get('tab') || 'terms')}</span>
  `;

  if(recEl) recEl.textContent = data.rec;
  if(recDet) recDet.textContent = data.recDetail;

  if(evBody){
    evBody.innerHTML = '';
    (data.evidenceRows || []).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]}</td>`;
      evBody.appendChild(tr);
    });
  }

  if(exactBody){
    exactBody.innerHTML = '';
    (data.exactItems || []).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>`;
      exactBody.appendChild(tr);
    });
  }
}

// ----- Insights by Campaign -----
const insightsByCampaign = {
  'Core Services': [
    {
      title: 'High waste from low-intent search terms',
      description: 'Users are researching, not booking. These terms have high clicks and near-zero leads.',
      type: 'Waste',
      severity: 'High',
      impact: '$640 / 30d',
      confidence: '0.86',
      evidence: '18 terms',
      actionLink: '#insights',
      actionText: 'View Details',
      actionFn: () => go('insights')
    },
    {
      title: 'Broad expansion generating unrelated impressions',
      description: 'Two campaigns match loosely related queries, driving spend without conversions.',
      type: 'Waste',
      severity: 'Medium',
      impact: '$410 / 30d',
      confidence: '0.73',
      evidence: '2 campaigns',
      actionLink: '#insights',
      actionText: 'View Details',
      actionFn: () => go('insights')
    }
  ],
  'Botox': [
    {
      title: 'Under-spending on high-intent query cluster',
      description: 'High CVR but low impression share. Likely rank/budget limited.',
      type: 'Opportunity',
      severity: 'Medium',
      impact: '+22 leads / 30d',
      confidence: '0.69',
      evidence: 'IS lost (rank) 31%',
      actionLink: '#insights',
      actionText: 'View Details',
      actionFn: () => go('insights')
    }
  ],
  'Account-wide': [
    {
      title: 'Tracking anomaly: lead form likely double-counting',
      description: 'Conversion fires multiple times per session, inflating performance metrics.',
      type: 'Tracking',
      severity: 'High',
      impact: 'data reliability risk',
      confidence: '0.78',
      evidence: 'conv/session 1.9',
      actionLink: '#insights',
      actionText: 'View Details',
      actionFn: () => go('insights')
    }
  ]
};

const campaignOverview = {
  'Core Services': {
    status: 'Needs attention',
    summary: 'High waste from low-intent search terms and broad expansion.',
    spend: '$12.4k',
    leads: '42',
    cpl: '$295',
    trendLabel: 'Leads (last 7 days)',
    trend: [3, 5, 4, 2, 6, 7, 4]
  },
  'Botox': {
    status: 'Growth opportunity',
    summary: 'High-intent cluster is underfunded. Increase rank to capture demand.',
    spend: '$6.1k',
    leads: '31',
    cpl: '$197',
    trendLabel: 'Leads (last 7 days)',
    trend: [2, 4, 3, 4, 5, 6, 7]
  },
  'Account-wide': {
    status: 'Tracking risk',
    summary: 'Lead form likely double-counting. Fix to restore reliable KPIs.',
    spend: '$21.8k',
    leads: '—',
    cpl: '—',
    trendLabel: 'Conversions (last 7 days)',
    trend: [9, 12, 11, 10, 15, 14, 13]
  }
};

function renderInsightsByCampaign(){
  const container = document.getElementById('campaignsList');
  if(!container) return;

  container.innerHTML = '';

  Object.keys(insightsByCampaign).forEach(campaignName => {
    const insights = insightsByCampaign[campaignName];
    const insightCount = insights.length;
    const highCount = insights.filter(i => i.severity === 'High').length;
    const medCount = insights.filter(i => i.severity === 'Medium').length;
    const lowCount = insights.filter(i => i.severity === 'Low').length;
    const overview = campaignOverview[campaignName] || {};

    const campaignEl = document.createElement('div');
    campaignEl.className = 'campaign-item';
    campaignEl.innerHTML = `
      <div class="campaign-header">
        <div>
          <div class="campaign-title">${campaignName}</div>
          <div class="campaign-meta">
            <span>${insightCount} insight${insightCount !== 1 ? 's' : ''}</span>
            <span class="tag">High: ${highCount}</span>
            <span class="tag">Medium: ${medCount}</span>
            <span class="tag">Low: ${lowCount}</span>
          </div>
        </div>
        <div class="campaign-toggle">▼</div>
      </div>
      <div class="campaign-summary">
        <div class="muted" style="margin-bottom:8px;">${overview.status || 'Status'}</div>
        <div style="font-weight:600; margin-bottom:10px;">${overview.summary || 'Summary not available.'}</div>
        <div class="meta" style="margin-bottom:12px;">
          <span class="tag">Spend: ${overview.spend || '—'}</span>
          <span class="tag">Leads: ${overview.leads || '—'}</span>
          <span class="tag">CPL: ${overview.cpl || '—'}</span>
        </div>
        <div class="row" style="gap:8px;">
          <button class="btn primary campaign-cta" data-campaign="${campaignName}">View campaign detail</button>
        </div>
      </div>
    `;

    const headerEl = campaignEl.querySelector('.campaign-header');
    headerEl.addEventListener('click', () => toggleCampaign(headerEl));
    const toggleEl = headerEl.querySelector('.campaign-toggle');
    toggleEl.classList.add('expanded');

    container.appendChild(campaignEl);
  });

  container.querySelectorAll('.campaign-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const campaign = e.currentTarget.getAttribute('data-campaign');
      go('campaign-detail', { campaign });
    });
  });
}

function toggleCampaign(headerEl){
  const campaignItem = headerEl.closest('.campaign-item');
  const toggleEl = headerEl.querySelector('.campaign-toggle');
  const summaryEl = campaignItem.querySelector('.campaign-summary');
  if(!summaryEl) return;

  const isExpanded = summaryEl.classList.contains('expanded');

  if(isExpanded){
    summaryEl.classList.remove('expanded');
    headerEl.classList.remove('active');
    toggleEl.classList.remove('expanded');
  } else {
    summaryEl.classList.add('expanded');
    headerEl.classList.add('active');
    toggleEl.classList.add('expanded');
  }
}

window.toggleCampaign = toggleCampaign;

function hydrateCampaignDetail(campaignKey){
  const data = campaignOverview[campaignKey] || campaignOverview['Core Services'];
  const titleEl = document.getElementById('campaignDetailTitle');
  const statusEl = document.getElementById('campaignDetailStatus');
  const summaryEl = document.getElementById('campaignDetailSummary');
  const kpiSpend = document.getElementById('campaignKpiSpend');
  const kpiLeads = document.getElementById('campaignKpiLeads');
  const kpiCpl = document.getElementById('campaignKpiCpl');
  const chartLabel = document.getElementById('campaignChartLabel');
  const chartPath = document.getElementById('campaignLinePath');
  const chartDots = document.getElementById('campaignLineDots');
  const insightsList = document.getElementById('campaignInsightsList');

  if(titleEl) titleEl.textContent = campaignKey;
  if(statusEl) statusEl.textContent = data.status || 'Status';
  if(summaryEl) summaryEl.textContent = data.summary || '';
  if(kpiSpend) kpiSpend.textContent = data.spend || '—';
  if(kpiLeads) kpiLeads.textContent = data.leads || '—';
  if(kpiCpl) kpiCpl.textContent = data.cpl || '—';
  if(chartLabel) chartLabel.textContent = data.trendLabel || 'Trend';

  if(chartPath && chartDots){
    const values = data.trend || [];
    const max = Math.max(...(values.length ? values : [1]));
    const min = Math.min(...(values.length ? values : [0]));
    const height = 120;
    const width = 400;
    const step = values.length > 1 ? width / (values.length - 1) : width;
    const points = values.map((val, idx) => {
      const x = idx * step;
      const scaled = max === min ? 0.5 : (val - min) / (max - min);
      const y = height - scaled * height;
      return { x, y, val };
    });

    chartPath.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
    chartDots.innerHTML = '';
    points.forEach(p => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('r', 4);
      dot.setAttribute('class', 'line-dot');
      dot.setAttribute('aria-label', `Value ${p.val}`);
      chartDots.appendChild(dot);
    });
  }

  if(insightsList){
    const insights = insightsByCampaign[campaignKey] || [];
    insightsList.innerHTML = '';
    insights.forEach(insight => {
      const item = document.createElement('div');
      item.className = 'item';
      const severityClass = insight.severity === 'High' ? 'sev-high' : insight.severity === 'Medium' ? 'sev-med' : 'sev-low';
      item.innerHTML = `
        <div class="item-top">
          <div>
            <strong>${insight.title}</strong>
            <div class="muted">${insight.description}</div>
            <div class="meta">
              <span class="tag">Type: ${insight.type}</span>
              <span class="tag">Severity: <span class="${severityClass}">${insight.severity}</span></span>
              <span class="tag">${insight.type === 'Opportunity' ? 'Est. uplift' : 'Est. impact'}: ${insight.impact}</span>
              <span class="tag">Confidence: ${insight.confidence}</span>
              <span class="tag">Evidence: ${insight.evidence}</span>
            </div>
          </div>
          <div class="row" style="gap:8px;">
            <button class="btn" onclick="go('insights')">${insight.actionText}</button>
            <button class="btn primary" onclick="go('action')">Add as Task</button>
          </div>
        </div>
      `;
      insightsList.appendChild(item);
    });
  }
}

// ----- Task guide/apply hydration (fake but meaningful) -----
const taskData = {
  negatives_18: {
    title: 'Add negatives (18 research terms)',
    summary: 'Block low-intent research traffic that consumes spend without leads. This is a safe, reversible quick win.',
    steps: [
      'Open Google Ads → Tools & Settings → Shared library → Negative keyword lists.',
      'Create or open a list named “Research Terms (Auto)”.',
      'Add the items below (match type included).',
      'Apply the list to Campaign: “Core Services” (and optionally “Botox” if overlap is detected).',
      'Monitor results for 3–7 days, then review the “insights” again.'
    ],
    items: [
      ['what is dermal filler','Phrase','Campaign: Core Services · Ad group: Filler – Generic'],
      ['filler side effects','Phrase','Campaign: Core Services · Ad group: Filler – Generic'],
      ['before and after filler','Exact','Campaign: Core Services · Ad group: Filler – Generic']
    ],
    changes: [
      ['Add negative keywords','Campaign: Core Services','18 terms (phrase/exact) to block research traffic'],
      ['Attach negative list','Campaign: Botox','Optional, only if overlap is detected']
    ]
  },
  limit_broad_2: {
    title: 'Limit broad expansion on 2 campaigns',
    summary: 'Reduce unrelated impressions and clicks caused by loose matching. Improves lead quality and lowers wasted spend.',
    steps: [
      'Open Campaigns → select the two flagged campaigns.',
      'Review Keywords → identify broad match keywords driving low-quality terms.',
      'Add phrase/exact versions for high-intent terms; pause the broad ones temporarily.',
      'Add a negative keyword list for “research” themes discovered in insights.',
      'Re-check Search terms after 72 hours.'
    ],
    items: [
      ['filler','Pause Broad','Campaign: Core Services · Ad group: Filler – Generic'],
      ['botox','Tighten / split','Campaign: Botox · Ad group: Botox – Generic']
    ],
    changes: [
      ['Pause/limit broad keywords','Core Services + Botox','Tighten match and split intent groups'],
      ['Add negatives list','Core Services + Botox','Block research queries leaking in']
    ]
  },
  fix_double_count: {
    title: 'Fix lead form conversion double-counting',
    summary: 'Your lead conversion fires multiple times per session. Fixing it restores accurate CPL and stops wrong optimization.',
    steps: [
      'Go to Goals → Conversions → Summary (or Tools → Conversions).',
      'Open “Lead – Contact Form Submit”.',
      'Change counting from “Every” to “One”.',
      'Check for duplicate tags (GA4 import + Ads tag) and keep only one primary conversion.',
      'Test a real form submission and verify exactly one conversion is recorded.'
    ],
    items: [
      ['Lead – Contact Form Submit','Counting: One','Account-level conversion action'],
      ['GA4 – Lead (import)','Set secondary or remove','Avoid duplicates']
    ],
    changes: [
      ['Change conversion counting','Lead – Contact Form Submit','Every → One'],
      ['Remove duplicates','Tags/Imports','Keep one primary lead conversion']
    ]
  },
  rank_cluster: {
    title: 'Increase rank for “same-day booking” cluster',
    summary: 'High CVR cluster is losing impression share due to rank. Improving rank increases leads without harming CPL.',
    steps: [
      'Open Search keywords → filter to the “same-day booking” cluster.',
      'Improve ad relevance: use the cluster terms in headlines and descriptions.',
      'Ensure landing page matches “same-day” intent (fast booking CTA).',
      'Increase bids modestly or set a target CPA if you have enough conversion volume.',
      'Monitor impression share lost (rank) and CPL for 7–14 days.'
    ],
    items: [
      ['same day lip filler','Exact/Phrase','Campaign: Core Services · Ad group: Same-day booking'],
      ['book lip filler today','Exact/Phrase','Campaign: Core Services · Ad group: Same-day booking']
    ],
    changes: [
      ['Ad copy refresh','Same-day booking','Add intent keywords to headlines'],
      ['Bid/rank improvement','Same-day cluster','Recover IS lost (rank)']
    ]
  },
  reallocate_budget: {
    title: 'Reallocate weekday budgets from low performers',
    summary: 'Shift budget from low-quality segments to the best performers during weekdays for more leads at similar CPL.',
    steps: [
      'Identify low-performing segments in insights (location/device/schedule).',
      'Reduce spend where leads are near-zero (e.g., late-night hours, low-performing locations).',
      'Move saved budget to the top campaign/ad group segments during Mon–Thu.',
      'Track the change in leads and CPL for 7 days.',
      'If CPL rises, roll back or cap the increase.'
    ],
    items: [
      ['01:00–06:00 schedule','Reduce bids -30%','Campaign: Core Services · Ad group: Filler – Generic'],
      ['Dubai Marina','Increase +10%','Campaign: Core Services · Ad group: Lip Filler']
    ],
    changes: [
      ['Schedule bid adjustment','Core Services','Reduce low-intent hours'],
      ['Budget shift','Core Services','Move budget to high-performing segments']
    ]
  }
};

function hydrateTask(taskKey){
  const t = taskData[taskKey] || taskData.negatives_18;

  // Guide
  const gTitle = document.getElementById('guideTitle');
  const gSum = document.getElementById('guideSummary');
  const gSteps = document.getElementById('guideSteps');
  const gItems = document.getElementById('guideItems');
  if(gTitle) gTitle.textContent = t.title;
  if(gSum) gSum.textContent = t.summary;
  if(gSteps){
    gSteps.innerHTML = '';
    t.steps.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      gSteps.appendChild(li);
    });
  }
  if(gItems){
    gItems.innerHTML = '';
    t.items.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`;
      gItems.appendChild(tr);
    });
  }

  // Apply
  const aTitle = document.getElementById('applyTitle');
  const aSum = document.getElementById('applySummary');
  const aChanges = document.getElementById('applyChanges');
  if(aTitle) aTitle.textContent = t.title;
  if(aSum) aSum.textContent = t.summary;
  if(aChanges){
    aChanges.innerHTML = '';
    t.changes.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`;
      aChanges.appendChild(tr);
    });
  }
}

function hydrate(){
  const { page, params } = parseHash();
  setActive(page);

  // Insights page
  if(page === 'insights'){
    renderInsightsByCampaign();
  }

  // Waste detail
  if(page === 'waste-detail'){
    const item = params.get('item') || 'term_what_is_filler';
    hydrateWasteDetail(item);
  }

  // Task guide/apply
  if(page === 'task-guide' || page === 'task-apply'){
    const task = params.get('task') || 'negatives_18';
    hydrateTask(task);
  }

  // Campaign detail
  if(page === 'campaign-detail'){
    const campaign = params.get('campaign') || 'Core Services';
    hydrateCampaignDetail(campaign);
  }
}

function bootstrapWireframe(){
  window.addEventListener('hashchange', hydrate);
  hydrate();
}

window.bootstrapWireframe = bootstrapWireframe;
