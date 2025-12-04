// API base URL
const API_BASE = '/api';

// Chart instance
let performanceChart = null;

// Update clock
function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    clock.textContent = timeString;
}

// Fetch and update overview stats
async function updateOverview() {
    try {
        const response = await fetch(`${API_BASE}/overview`);
        const data = await response.json();
        
        document.getElementById('totalSessions').textContent = data.totalSessions;
        document.getElementById('activeSessions').textContent = data.activeSessions;
        document.getElementById('totalUsers').textContent = data.totalUsers;
        document.getElementById('totalHosts').textContent = data.totalHosts;
    } catch (error) {
        console.error('Error fetching overview:', error);
    }
}

// Fetch and display sessions
async function updateSessions() {
    try {
        const response = await fetch(`${API_BASE}/sessions`);
        const sessions = await response.json();
        
        const tbody = document.getElementById('sessionsTable');
        
        if (sessions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No active sessions</td></tr>';
            return;
        }
        
        tbody.innerHTML = sessions.map(session => `
            <tr>
                <td><code>${session.session_id}</code></td>
                <td>${session.username}</td>
                <td>${session.host_pool}</td>
                <td><span class="status-badge ${session.status}">${session.status.toUpperCase()}</span></td>
                <td>${session.cpu_usage.toFixed(1)}%</td>
                <td>${session.memory_usage.toFixed(1)}%</td>
                <td>${formatDuration(session.duration)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching sessions:', error);
    }
}

// Fetch and display host pools
async function updateHostPools() {
    try {
        const response = await fetch(`${API_BASE}/hostpools`);
        const hostPools = await response.json();
        
        const grid = document.getElementById('hostPoolsGrid');
        
        if (hostPools.length === 0) {
            grid.innerHTML = '<div class="loading">No host pools available</div>';
            return;
        }
        
        grid.innerHTML = hostPools.map(pool => `
            <div class="host-pool-card">
                <div class="host-pool-header">
                    <div class="host-pool-name">${pool.name}</div>
                    <span class="host-pool-status ${pool.status}">${pool.status.toUpperCase()}</span>
                </div>
                <div class="host-pool-region">📍 ${pool.region}</div>
                <div class="host-pool-metrics">
                    <div class="metric">
                        <div class="metric-label">CPU Usage</div>
                        <div class="metric-value">${pool.cpu_usage.toFixed(1)}%</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Memory</div>
                        <div class="metric-value">${pool.memory_usage.toFixed(1)}%</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Load</div>
                        <div class="metric-value">${pool.current_load}/${pool.total_capacity}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Status</div>
                        <div class="metric-value">${pool.status === 'online' ? '🟢' : '🔴'}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching host pools:', error);
    }
}

// Fetch and display alerts
async function updateAlerts() {
    try {
        const response = await fetch(`${API_BASE}/alerts`);
        const alerts = await response.json();
        
        document.getElementById('alertCount').textContent = alerts.length;
        
        const alertsList = document.getElementById('alertsList');
        
        if (alerts.length === 0) {
            alertsList.innerHTML = '<div class="loading">No active alerts</div>';
            return;
        }
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <div class="alert-severity">${alert.severity}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${formatTime(alert.created_at)} • ${alert.source}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching alerts:', error);
    }
}

// Initialize and update performance chart
async function updatePerformanceChart() {
    try {
        const response = await fetch(`${API_BASE}/metrics`);
        const metrics = await response.json();
        
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        if (performanceChart) {
            performanceChart.destroy();
        }
        
        performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: metrics.map(m => m.time),
                datasets: [
                    {
                        label: 'CPU Usage',
                        data: metrics.map(m => parseFloat(m.cpu)),
                        borderColor: '#ff006e',
                        backgroundColor: 'rgba(255, 0, 110, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Memory Usage',
                        data: metrics.map(m => parseFloat(m.memory)),
                        borderColor: '#00f5ff',
                        backgroundColor: 'rgba(0, 245, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Active Sessions',
                        data: metrics.map(m => parseInt(m.sessions)),
                        borderColor: '#00ff41',
                        backgroundColor: 'rgba(0, 255, 65, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e7ff',
                            font: {
                                family: 'Rajdhani',
                                size: 12
                            },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 41, 0.95)',
                        titleColor: '#00f5ff',
                        bodyColor: '#e0e7ff',
                        borderColor: '#1e2747',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.datasetIndex === 2 
                                        ? context.parsed.y 
                                        : context.parsed.y.toFixed(2) + '%';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(30, 39, 71, 0.5)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8b92b8',
                            font: {
                                family: 'Rajdhani',
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(30, 39, 71, 0.5)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8b92b8',
                            font: {
                                family: 'Rajdhani',
                                size: 11
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#8b92b8',
                            font: {
                                family: 'Rajdhani',
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating performance chart:', error);
    }
}

// Helper function to format duration
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${Math.floor(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
}

// Helper function to format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleString();
}

// Initialize dashboard
async function initDashboard() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initial load
    await Promise.all([
        updateOverview(),
        updateSessions(),
        updateHostPools(),
        updateAlerts(),
        updatePerformanceChart()
    ]);
    
    // Refresh intervals
    setInterval(updateOverview, 5000);
    setInterval(updateSessions, 10000);
    setInterval(updateHostPools, 15000);
    setInterval(updateAlerts, 10000);
    setInterval(updatePerformanceChart, 30000);
}

// Start dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);
