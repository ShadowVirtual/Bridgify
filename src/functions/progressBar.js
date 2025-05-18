const createProgressBar = (current, total) => {
    try {
        const percentage = Math.round((current / total) * 10);
        var progressBar = '🟩'.repeat(percentage) + '🟨'.repeat(10 - percentage);
    } catch (err) {
        
        console.log(err);
        const percentage = Math.round((current / total) * 10);
        var progressBar = 'ERR 🟥'.repeat(percentage) + '🟨'.repeat(10 - percentage);
    }
    return progressBar;
};

module.exports = { createProgressBar };
