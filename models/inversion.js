'use strict';

module.exports = (sequelize, DataTypes) => {
    var Inversion = sequelize.define('Inversion', {
        inversionId: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        montoInicial: {
            type: DataTypes.FLOAT(15, 2)
        },
        empresaId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
        
    }, {
        timestamps: false,
    }, );

    Inversion.associate = function (models) {
        models.Inversion.belongsTo(models.Empresa, {
            foreignKey: 'empresaId',
        });
        models.Empresa.hasMany(models.Inversion, {
            foreignKey: 'empresaId',
        });
    };

    return Inversion;
};