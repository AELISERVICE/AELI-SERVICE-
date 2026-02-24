const { Provider, sequelize } = require('./src/models');
async function run() {
    await sequelize.authenticate();
    const provider = await Provider.findOne({ where: { photos: { [require('sequelize').Op.ne]: null } } });
    if (provider) {
        console.log("Provider ID:", provider.id);
        console.log("Photos in raw data:", provider.getDataValue('photos'));
        console.log("Photos in toJSON:", provider.toJSON().photos);
    } else {
        console.log("No provider with photos found. Let me try querying any provider:");
        const anyProv = await Provider.findOne();
        if (anyProv) {
            console.log("Provider ID:", anyProv.id);
            console.log("Photos raw:", anyProv.getDataValue('photos'));
        } else {
            console.log("No providers at all.");
        }
    }
    process.exit(0);
}
run();
