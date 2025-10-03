// simple algorithm: words / 200 words-per-minute -> round up
function estimateReadingTime(text) {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const wpm = 200;
    const minutes = Math.max(1, Math.ceil(words / wpm));
    return minutes;
}

module.exports = estimateReadingTime;
