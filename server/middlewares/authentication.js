const jwt = require('jsonwebtoken');

let validateToken = (req, res, next) => {
    let token = req.get('Authorization');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'invalid token.'
                }
            });
        }
        req.user = decoded.user;
        next();
    });
};

let validateAdminRole = (req, res, next) => {
    let user = req.user;
    if (user.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'user is not Admin'
            }
        });
    }

};
module.exports = {
    validateToken,
    validateAdminRole
}