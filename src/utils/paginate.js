function paginate(req) {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

module.exports = paginate;
