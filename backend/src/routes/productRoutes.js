// backend/src/routes/productRoutes.js

const productController = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

async function handleProductRoutes(req, res, parsedUrl, method, getRequestBody, sendJsonResponse) {
    const requestPath = parsedUrl.pathname;
    const productIdMatch = requestPath.match(/^\/api\/produtos\/(\d+)$/);
    const productId = productIdMatch ? parseInt(productIdMatch[1]) : null;

    req.params = req.params || {};
    if (productId) {
        req.params.id = productId;
    }

    if (requestPath === '/api/produtos') {
        if (method === 'POST') {
            return await authorizeAdmin(req, res, async () => {
                const body = await getRequestBody(req);
                req.body = body;
                return productController.create(req, res);
            });
        }
        if (method === 'GET') {
            return await authenticate(req, res, async () => {
                return productController.getAll(req, res);
            });
        }
    }

    if (productId) {
        if (method === 'PUT') {
            return await authorizeAdmin(req, res, async () => {
                const body = await getRequestBody(req);
                req.body = body;
                return productController.update(req, res);
            });
        }
        if (method === 'DELETE') {
            return await authorizeAdmin(req, res, async () => {
                return productController.remove(req, res);
            });
        }
    }

    return false;
}

module.exports = handleProductRoutes;