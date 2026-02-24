const request = require('supertest');
const app = require('./src/app');
const { Provider, sequelize } = require('./src/models');

async function run() {
    await sequelize.authenticate();
    const provider = await Provider.findOne({ where: { photos: { [require('sequelize').Op.ne]: null } } });
    if (provider) {
        console.log("Found provider with ID:", provider.id);
        const res = await request(app).get('/api/providers/' + provider.id);
        console.log("API Response photos:", res.body.data.provider.photos);
        console.log("Subscription:", res.body.data.provider.subscription);
    } else {
        console.log("No provider with photos found.");
    }
    process.exit(0);
}
run();
