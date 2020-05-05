const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool, Query } = require("pg");
const app = express();
const PORT = process.env.PORT || 5000;

let DBUrl_PG, DBUrl_MY, DBPool, DBClient, spatial_query;

const DB = process.env.DB_DRIVER || "postgres";
const DBUser = process.env.DB_USER || "username";
const DBPass = process.env.DB_PASSWORD || "";
const DBHost = process.env.DB_HOST || "localhost";
const DBPort = process.env.DB_PORT || "5432";
const DBName = process.env.DB_NAME || "meetup";

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/assets/leaflet-groupedlayercontrol/:file", (req, res) => {
  let { file } = req.params;
  res.sendFile(path.join(__dirname, "assets", "leaflet-groupedlayercontrol", file));
});
app.get("/assets/js/:file", (req, res) => {
  let { file } = req.params;
  res.sendFile(path.join(__dirname, "assets", "js", file));
});
app.get("/assets/css/:file", (req, res) => {
  let { file } = req.params;
  res.sendFile(path.join(__dirname, "assets", "css", file));
});
app.get("/assets/img/:file", (req, res) => {
  let { file } = req.params;
  res.sendFile(path.join(__dirname, "assets", "img", file));
});

app.get("/api/:table", (req, res) => {
  DBUrl_PG = `${DB}://${DBUser}@${DBHost}:${DBPort}/${DBName}`;
  DBPool = new Pool({ connectionString: DBUrl_PG, max: 1000 });
  DBPool.connect()
  .then(client => {
    DBClient = client;
    let { table } = req.params;
    let { fields, filter } = req.query;

    if (table) {
      if (
        table.indexOf("--") > -1 ||
        table.indexOf("'") > -1 ||
        table.indexOf(";") > -1 ||
        table.indexOf("/*") > -1 ||
        table.indexOf("xp_") > -1
      ) {
        console.log("SQL INJECTION ALERT");
        res.status(403).send({
          statusCode: 403,
          status: "Error 403 Unauthorized",
          error: "Disallowed Characters in Request URL"
        });
        return;
      } else {
        if (fields && filter) {
          if (
            fields.indexOf("--") > -1 ||
            fields.indexOf(";") > -1 ||
            fields.indexOf("/*") > -1 ||
            fields.indexOf("xp_") > -1 ||
            filter.indexOf("--") > -1 ||
            filter.indexOf(";") > -1 ||
            filter.indexOf("/*") > -1 ||
            filter.indexOf("xp_") > -1
          ) {
            console.log("SQL INJECTION ALERT");
            res.status(403).send({
              statusCode: 403,
              status: "Error 403 Unauthorized",
              error: "Disallowed Characters in Request URL"
            });
            return;
          } else {
            let fieldsArr = fields.split(",");
            for (let i = 0; i < fieldsArr.length; i++) {
              if (fieldsArr[i] === "id") {
                fieldsArr[i] = `${fieldsArr[i]} = ${filter}`;
              } else if (fieldsArr[i] === "time") {
                fieldsArr[i] = `${fieldsArr[i]} > '${filter}'`;
              } else {
                fieldsArr[i] = `${fieldsArr[i]} LIKE '${filter}'`;
              }
            }
            fieldsArr = fieldsArr.join(" OR ");
            spatial_query = `SELECT jsonb_build_object(
              'type', 'FeatureCollection',
              'features', jsonb_agg(features.feature)
            ) AS data FROM (
              SELECT jsonb_build_object(
                'type',       'Feature',
                'geometry',   ST_AsGeoJSON(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326), 10, 10)::jsonb,
                'properties', to_jsonb(inputs) - 'geom'
              ) AS feature
              FROM (SELECT * FROM \"${table}\" WHERE (${fieldsArr}) ORDER BY time desc) AS inputs) features;`;
            }
          } else {
            spatial_query = `SELECT jsonb_build_object(
              'type',     'FeatureCollection',
              'features', jsonb_agg(features.feature)
            ) AS data FROM (
              SELECT jsonb_build_object(
                'type',       'Feature',
                'geometry',   ST_AsGeoJSON(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326), 10, 10)::jsonb,
                'properties', to_jsonb(inputs) - 'geom'
              ) AS feature
              FROM (SELECT * FROM \"${table}\" ORDER BY time desc) AS inputs) features;`;
            }
            const DBQuery = client.query(spatial_query)
            .then(results => {
              res.json(results.rows[0].data);
              client.end();
            })
            .catch(err => {
              res.status(500).send({
                statusCode: 500,
                status: "Error 500 Internal Server Error",
                error: err
              });
            });
          }
        } else {
          res.status(403).send({
            statusCode: 403,
            status: "Error 403 Unauthorized",
            error: "Request Malformed"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          statusCode: 500,
          status: "Error 500 Internal Server Error",
          error: "Could not connect to database"
        });
      }
    );
  }
);

app.listen(PORT, console.log(`Server started on port ${PORT}`));
