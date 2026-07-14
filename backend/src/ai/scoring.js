// backend/src/ai/scoring.js
// Industry-specific KPI scoring framework
// Supports: call_center, sales, insurance, banking, telecom, healthcare, real_estate, ecommerce

export const INDUSTRIES = {
  call_center: {
    name: 'Call Center / Customer Support',
    kpi_groups: {
      communication: {
        label: 'Communication Quality', weight: 0.25,
        kpis: ['greeting_quality','clarity','listening','empathy','confidence','patience','talk_ratio','interruption_control','closing_quality','professional_language'],
      },
      resolution: {
        label: 'Resolution & Efficiency', weight: 0.30,
        kpis: ['first_call_resolution','handle_time_efficiency','escalation_avoidance','problem_identification','solution_accuracy','follow_through'],
      },
      cx: {
        label: 'Customer Experience', weight: 0.20,
        kpis: ['rapport_building','personalisation','customer_effort','satisfaction_signals','complaint_handling','proactive_assistance'],
      },
      compliance: {
        label: 'Compliance & Operations', weight: 0.25,
        kpis: ['policy_accuracy','data_security','script_adherence','disclosure_completion','crm_discipline','sla_adherence'],
      },
    },
    formula: (g) => g.communication*0.25 + g.resolution*0.30 + g.cx*0.20 + g.compliance*0.25,
  },

  sales: {
    name: 'Sales / Lead Conversion',
    kpi_groups: {
      lead_conversion: {
        label: 'Lead Conversion', weight: 0.30,
        kpis: ['lead_conversion_rate','contact_rate','first_call_conversion','follow_up_success','appointment_booking_rate','avg_response_time'],
      },
      agent_behavior: {
        label: 'Agent Behavior', weight: 0.35,
        kpis: ['needs_discovery','product_knowledge','objection_handling','call_quality','customer_engagement','closing_attempt_rate','urgency_creation','social_proof_usage','rapport_first_minute','open_ended_questions','benefit_vs_feature_ratio','next_step_clarity'],
      },
      customer_satisfaction: {
        label: 'Customer Satisfaction', weight: 0.20,
        kpis: ['csat','nps_prediction','trust_score','buying_signal_index'],
      },
      deal_intelligence: {
        label: 'Deal Intelligence', weight: 0.15,
        kpis: ['deal_probability','competitor_handling','price_objection_handling','decision_maker_identified','budget_qualified','timeline_established'],
      },
    },
    formula: (g) => g.lead_conversion*0.30 + g.agent_behavior*0.35 + g.customer_satisfaction*0.20 + g.deal_intelligence*0.15,
  },

  insurance: {
    name: 'Insurance Sales & Support',
    kpi_groups: {
      sales_skills: { label: 'Sales Skills', weight: 0.30, kpis: ['needs_assessment','policy_explanation','premium_justification','risk_explanation','upsell_add_ons','closing_rate'] },
      compliance: { label: 'Regulatory Compliance', weight: 0.35, kpis: ['fca_disclosure','cooling_off_explanation','data_protection','conflict_of_interest','policy_accuracy','complaint_handling'] },
      cx: { label: 'Customer Experience', weight: 0.20, kpis: ['empathy','clarity','patience','csat','trust_score'] },
      efficiency: { label: 'Efficiency', weight: 0.15, kpis: ['handle_time','first_call_resolution','crm_discipline'] },
    },
    formula: (g) => g.sales_skills*0.30 + g.compliance*0.35 + g.cx*0.20 + g.efficiency*0.15,
  },

  banking: {
    name: 'Banking & Financial Services',
    kpi_groups: {
      sales: { label: 'Cross-sell / Upsell', weight: 0.25, kpis: ['product_pitch','cross_sell_rate','upsell_success','financial_needs_assessment','rate_justification'] },
      compliance: { label: 'Regulatory Compliance', weight: 0.40, kpis: ['aml_check','kyc_adherence','pci_compliance','gdpr_compliance','mis_selling_prevention','disclosure_accuracy','data_security'] },
      cx: { label: 'Customer Experience', weight: 0.20, kpis: ['empathy','problem_resolution','personalisation','csat','trust_score'] },
      efficiency: { label: 'Efficiency', weight: 0.15, kpis: ['handle_time','fcr','escalation_avoidance'] },
    },
    formula: (g) => g.sales*0.25 + g.compliance*0.40 + g.cx*0.20 + g.efficiency*0.15,
  },

  telecom: {
    name: 'Telecom / Mobile Services',
    kpi_groups: {
      sales: { label: 'Sales & Retention', weight: 0.30, kpis: ['upsell_rate','churn_prevention','upgrade_success','bundle_pitch','contract_renewal_rate'] },
      technical: { label: 'Technical Resolution', weight: 0.30, kpis: ['technical_accuracy','first_call_resolution','troubleshooting_skill','escalation_avoidance','network_knowledge'] },
      cx: { label: 'Customer Experience', weight: 0.25, kpis: ['empathy','clarity','patience','csat','nps_prediction'] },
      compliance: { label: 'Compliance', weight: 0.15, kpis: ['ofcom_compliance','data_protection','disclosure_completion'] },
    },
    formula: (g) => g.sales*0.30 + g.technical*0.30 + g.cx*0.25 + g.compliance*0.15,
  },

  healthcare: {
    name: 'Healthcare & Medical Services',
    kpi_groups: {
      patient_care: { label: 'Patient Care Quality', weight: 0.35, kpis: ['empathy','active_listening','clear_explanation','appointment_scheduling','follow_up_care','sensitivity'] },
      compliance: { label: 'HIPAA & Compliance', weight: 0.35, kpis: ['hipaa_compliance','phi_protection','data_security','consent_obtained','accurate_information','referral_accuracy'] },
      efficiency: { label: 'Operational Efficiency', weight: 0.20, kpis: ['handle_time','first_call_resolution','appointment_booking_rate','crm_discipline'] },
      satisfaction: { label: 'Patient Satisfaction', weight: 0.10, kpis: ['csat','communication_clarity','trust_score'] },
    },
    formula: (g) => g.patient_care*0.35 + g.compliance*0.35 + g.efficiency*0.20 + g.satisfaction*0.10,
  },

  real_estate: {
    name: 'Real Estate & Property',
    kpi_groups: {
      sales: { label: 'Sales Effectiveness', weight: 0.35, kpis: ['needs_discovery','budget_qualification','property_knowledge','viewing_booking_rate','follow_up_success','closing_rate'] },
      client_management: { label: 'Client Management', weight: 0.30, kpis: ['rapport_building','trust_score','personalisation','long_term_relationship','referral_request'] },
      cx: { label: 'Client Experience', weight: 0.25, kpis: ['empathy','communication_quality','responsiveness','csat'] },
      compliance: { label: 'Compliance', weight: 0.10, kpis: ['data_protection','disclosure_accuracy','fair_dealing'] },
    },
    formula: (g) => g.sales*0.35 + g.client_management*0.30 + g.cx*0.25 + g.compliance*0.10,
  },

  ecommerce: {
    name: 'E-Commerce & Retail',
    kpi_groups: {
      sales: { label: 'Sales & Upsell', weight: 0.30, kpis: ['upsell_success','cross_sell_rate','cart_value_increase','promotion_pitch','closing_rate'] },
      cx: { label: 'Customer Experience', weight: 0.35, kpis: ['empathy','problem_resolution','refund_handling','complaint_management','personalisation','csat'] },
      efficiency: { label: 'Operational Efficiency', weight: 0.25, kpis: ['handle_time','first_call_resolution','order_accuracy','escalation_avoidance'] },
      compliance: { label: 'Compliance', weight: 0.10, kpis: ['consumer_rights_adherence','gdpr_compliance','return_policy_accuracy'] },
    },
    formula: (g) => g.sales*0.30 + g.cx*0.35 + g.efficiency*0.25 + g.compliance*0.10,
  },
};

export function getIndustryConfig(industry) {
  return INDUSTRIES[industry] || INDUSTRIES.call_center;
}

// Agent score formula — weighted average of group scores
export function calculateIndustryScore(groupScores, industry) {
  const config = getIndustryConfig(industry);
  return Math.round(config.formula(groupScores));
}

// Calculate agent overall from raw KPI scores
export function calculateAgentScore(kpiScores, industry) {
  const config = getIndustryConfig(industry);
  const groupScores = {};
  for (const [groupKey, groupDef] of Object.entries(config.kpi_groups)) {
    const groupKpis = groupDef.kpis.filter(k => kpiScores[k] != null);
    if (groupKpis.length === 0) { groupScores[groupKey] = 70; continue; }
    const avg = groupKpis.reduce((s, k) => s + (kpiScores[k] || 0), 0) / groupKpis.length;
    groupScores[groupKey] = Math.round(avg);
  }
  return { groupScores, overall: calculateIndustryScore(groupScores, industry) };
}

// Legacy simple formula (for backwards compat)
export function calculateSimpleAgentScore(s) {
  return Math.round(
    (s.empathy||0)*0.20 + (s.professionalism||0)*0.20 +
    (s.resolution||0)*0.25 + (s.compliance||0)*0.20 + (s.efficiency||0)*0.15
  );
}
