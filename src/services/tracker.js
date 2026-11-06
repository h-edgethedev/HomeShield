const stats = {
    totalQueries: 0,
    blockedQueries: 0,
    recentLogs: []
};

/**
 * Record an incoming DNS query
 * @param {'Blocked'|'Allowed'} action 
 * @param {string} domain 
 * @param {string} device 
 */

function logQuery(action, domain, device) {
    stats.totalQueries++;
    if (action === "Blocked") {
        stats.blockedQueries++;
        stats.recentLogs.unshift({
            id: Date.now() + Math.random().toString(36).substr(2, 4),
            time: new Date().toLocaleTimeString(),
            action,
            domain,
            device
        })

        if (stats.recentLogs.length > 50) {
            stats.recentLogs.pop()
        }
    }

}

function getStats() {
    return stats
}
module.exports = { logQuery, getStats }