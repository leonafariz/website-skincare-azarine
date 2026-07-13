function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }
    
    const allowedEmail = process.env.ADMIN_EMAIL || 'leonafariz01@gmail.com';
    if (req.session.user.email !== allowedEmail) {
        return res.status(403).json({ error: 'Forbidden. Only admin can access this resource.' });
    }
    
    next();
}

module.exports = { requireAdmin };
