'use strict';

module.exports = (sequelize, DataTypes) => {
    var DeudaSocial = sequelize.define('DeudaSocial', {
        deudaSocialId: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        nombre: {
            type: DataTypes.STRING,
        },
        monto: {
            type: DataTypes.FLOAT(15, 2)
        },
        plazo: {
            type: DataTypes.STRING,
        },
        porcEjercicio: {
            type: DataTypes.FLOAT(5, 2)
        },
        cantCuotas: {
            type: DataTypes.INTEGER,
        },
        cuenta: {
            type: DataTypes.STRING,
        },
        mes1: {
            type: DataTypes.BOOLEAN
        },
        mes2: {
            type: DataTypes.BOOLEAN
        },
        mes3: {
            type: DataTypes.BOOLEAN
        },
        mes4: {
            type: DataTypes.BOOLEAN
        },
        mes5: {
            type: DataTypes.BOOLEAN
        },
        mes6: {
            type: DataTypes.BOOLEAN
        },
        mes7: {
            type: DataTypes.BOOLEAN
        },
        mes8: {
            type: DataTypes.BOOLEAN
        },
        mes9: {
            type: DataTypes.BOOLEAN
        },
        mes10: {
            type: DataTypes.BOOLEAN
        },
        mes11: {
            type: DataTypes.BOOLEAN
        },
        mes12: {
            type: DataTypes.BOOLEAN
        },

    }, {
        timestamps: false,
    }, );

    DeudaSocial.associate = function (models) {
        models.DeudaSocial.belongsTo(models.Empresa, {
            foreignKey: 'empresaId',
        });
        models.Empresa.hasMany(models.DeudaSocial, {
            foreignKey: 'empresaId',
        });
    };

    return DeudaSocial;
};