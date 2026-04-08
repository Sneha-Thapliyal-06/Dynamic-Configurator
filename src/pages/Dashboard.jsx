import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import "./Dashboard.css";
import {
  Monitor, FolderTree, GitBranch, Shield, TrendingUp, Boxes, ListTree, FileText, Activity, CircleCheckBig, Layers
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();


  const [counts, setCounts] = useState({
    screens: 0,
    groups: 0,
    fields: 0,
    workflows: 0,
    validations: 0,
    headers: 0,
    modules: 0,
    menus: 0,
    mappings: 0 
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [
          screenRes, workflowRes, groupRes, fieldRes, validationRes,
          headerRes, moduleRes, menuRes, mappingRes
        ] = await Promise.all([
          axios.get("https://services.rs-apps.online/DynamicConfig/api/screens"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/workflow/approval"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/groups"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/group-fields"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/field-validation"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/module-headers"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/modules"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/menus"),
          axios.get("https://services.rs-apps.online/DynamicConfig/api/workflow/mapping") 
        ]);

        setCounts({
          screens: screenRes.data?.length || 0,
          groups: groupRes.data?.length || 0,
          fields: fieldRes.data?.length || 0,
          workflows: workflowRes.data?.length || 0,
          validations: validationRes.data?.length || 0,
          headers: headerRes.data?.length || 0,
          modules: moduleRes.data?.length || 0,
          menus: menuRes.data?.length || 0,
          mappings: mappingRes.data?.length || 0 
        });
      } catch (err) {
        console.error("Dashboard stats fetch failed", err);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-container">
      <Navigation activePage="dashboard" />
      
      <div className="dashboard-main-wrapper">
        <div className="dashboard-header">
          <Activity color="var(--purple)" size={32} />
          <div>
            <strong>Configuration Dashboard</strong>
            <p>Manage all your application configurations in one place</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard 
            title="Total Screens" 
            subtitle={`${counts.groups} groups • ${counts.fields} fields`} 
            Icon={Monitor} 
            color="blue" 
            count={counts.screens} 
            action="View Screens" 
            route="/screen-config"
          />
          <StatCard 
            title="Module Headers" 
            subtitle={`${counts.modules} modules • ${counts.menus} menus`} 
            Icon={FolderTree} 
            color="purple" 
            count={counts.headers} 
            action="View Modules" 
            route="/module-menu-config"
          />
          <StatCard 
            title="Workflows" 
            subtitle={`${counts.workflows} approval levels`} 
            Icon={GitBranch} 
            color="green" 
            count={counts.workflows} 
            action="View Workflows"
            route="/workflow" 
          />
          <StatCard 
            title="Field Validations" 
            subtitle="Across all screens" 
            Icon={Shield} 
            color="orange" 
            count={counts.validations} 
            action="Configure" 
            route="/screen-config"
          />
        </div>

        <div className="dashboard-main-content">
          <div className="left-column">
            <div className="section-card">
              <h3 className="section-title"><TrendingUp color="var(--purple)" size={20} /> Quick Actions</h3>
             <div className="quick-actions-flex">
                <QuickCard 
                  title="Create New Screen"
                  desc="Build a screen with 4-step wizard"
                  Icon={Monitor}
                  color="blue"
                  route="/screen-master"
                />

                <QuickCard 
                  title="Configure Modules"
                  desc="Setup hierarchical module structure"
                  Icon={Boxes}
                  color="purple"
                  route="/module-menu-config" 
                />

                <QuickCard 
                  title="Setup Workflow"
                  desc="Create approval chains"
                  Icon={GitBranch}
                  color="green"
                  route="/workflow"    
                />
              </div>

            </div>

            <div className="section-card-haha">
              <h3 className="section-title"><Layers color="var(--purple)" size={20} /> Configuration Overview</h3>
              <OverviewRow 
                label="Screen Configuration" 
                unit="total" 
                Icon={Monitor} 
                totalCount={counts.screens}
                items={[
                  {l:'Groups', v:counts.groups}, 
                  {l:'Fields', v:counts.fields}, 
                  {l:'Validations', v:counts.validations}
                ]} 
                color="blue" 
              />
              <OverviewRow 
                label="Module & Menu Structure" 
                unit="items" 
                Icon={Boxes} 
                totalCount={counts.headers + counts.modules + counts.menus} 
                items={[
                  {l:'Headers', v:counts.headers}, 
                  {l:'Modules', v:counts.modules}, 
                  {l:'Menus', v:counts.menus}
                ]} 
                color="purple" 
              />
       
              <OverviewRow 
                label="Workflow Configuration" 
                unit="workflows" 
                Icon={GitBranch} 
                totalCount={counts.workflows} 
                items={[
                  {l:'Approval Levels', v:counts.workflows}, 
                  {l:'Screen Mappings', v:counts.mappings} 
                ]} 
                color="green" 
              />
            </div>
          </div>

          <div className="system-summary">
            <h3 className="section-title"><CircleCheckBig color="var(--purple)" size={18} className="success-icon" /> System Summary</h3>
            <SummaryRow Icon={Monitor} label="Screen configurations" value={`${counts.screens} configured`} color="blue" />
            <SummaryRow Icon={Boxes} label="Modules configured" value={`${counts.modules} configured`} color="purple" />
            <SummaryRow Icon={ListTree} label="Menu items" value={`${counts.menus} configured`} color="purple" />
            <SummaryRow Icon={GitBranch} label="Active workflows" value={`${counts.workflows} configured`} color="green" />
            
            <div className="status-badge-green">
              <CircleCheckBig color="green" size={18} />
              <div>
                <strong>System Active</strong>
                <p>All configurations operational</p>
              </div>
            </div>

            <div className="help-box">
              <FileText color="purple" size={32} />
              <div>
                <strong>Need Help?</strong>
                <p>Check out the documentation for detailed guides on each configuration type.</p>
                <span className="doc-link">View Documentation →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function StatCard({ title, subtitle, Icon, color, count, action,route  }) {
  const navigate = useNavigate();
  return (
    <div className={`stat-card border-${color}`}>
      <div className="stat-top">
        <div className={`icon-box-solid bg-solid-${color}`}>
          <Icon size={20} color="#ffffff" strokeWidth={2.5} />
        </div>
        <span className={`badge-${color}`}>{count}</span>
      </div>
      <h4>{title}</h4>
      <p>{subtitle}</p>
      <button 
        className={`text-${color}`} 
        onClick={() => route && navigate(route)}
        style={{ cursor: 'pointer' }}
      >
        {action} →
      </button>
    </div>
  );
}


function QuickCard({ title, desc, Icon, color, route }) {
  const navigate = useNavigate();

  return (
    <div
      className={`quick-card-v2 bg-light-${color}`}
      onClick={() => route && navigate(route)}
      style={{ cursor: 'pointer' }}
    >
      <div className={`icon-box-solid bg-solid-${color}`}>
        <Icon size={20} color="#ffffff" strokeWidth={2.5} />
      </div>
      <h4 className="quick-card-title">{title}</h4>
      <p className="quick-card-desc">{desc}</p>
      <span className={`text-${color} quick-card-btn`}>Get Started →</span>
    </div>
  );
}


function OverviewRow({ label, items, color, unit, Icon, totalCount }) {
  return (
    <div className={`overview-row-container row-bg-${color}`}>
      <div className="overview-minimal-header">
        <div className="header-left-content">
          {Icon && <Icon size={18} className={`text-${color}`} />}
          <span className={`text-${color} overview-title`}>{label}</span>
        </div>
        <span className={`badge-${color} overview-total-badge`}>{totalCount} {unit}</span>
      </div>
      
      <div className="overview-body-grid">
        {items.map((item, i) => (
          <div key={i} className="overview-metric-box">
            <div className="overview-value">{item.v}</div>
            <div className="overview-label">{item.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ Icon, label, value, color }) {
  return (
    <div className={`summary-row-v2 row-bg-light-${color}`}>
      <div className={`summary-icon-box bg-solid-${color}`}>
        <Icon size={18} color="#ffffff" strokeWidth={2.5} />
      </div>
      <div className="summary-info">
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}