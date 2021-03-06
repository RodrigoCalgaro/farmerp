'use strict';

module.exports = (sequelize, DataTypes) => {
    var CategoriaHacienda = sequelize.define('CategoriaHacienda', {
        categoriaHaciendaId: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        nombre: {
            type: DataTypes.STRING,
        },
        procreo: {
            type: DataTypes.FLOAT(10,2),
        },
        abigeato: {
            type: DataTypes.FLOAT(10,2),
        },
        refugo: {
            type: DataTypes.FLOAT(10,2),
        },
        descarte: {
            type: DataTypes.FLOAT(10,2),
        },
        cut: {
            type: DataTypes.FLOAT(10,2),
        },
        tipoHaciendaId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        empresaId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
    }, );

    CategoriaHacienda.associate = function (models) {
        models.CategoriaHacienda.belongsTo(models.Empresa, {
            foreignKey: 'empresaId', 
        });
        models.Empresa.hasMany(models.CategoriaHacienda, {
            foreignKey: 'empresaId',
        });

        models.CategoriaHacienda.belongsTo(models.TipoHacienda, {
            foreignKey: 'tipoHaciendaId',
        });
        models.TipoHacienda.hasMany(models.CategoriaHacienda, {
            foreignKey: 'tipoHaciendaId',
        });
    };

    return CategoriaHacienda;
};