const express = require('express');
const {open} = require('sqlite');

const sqlite3 = require('sqlite3');
const path = require('path');

const dbpath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDbAndServer = async() => {
try {
    db = await open({
        filename:dbPath,
        driver:sqlite3.Database,
    });
    app.listen(3000,() => {
        console.log("Server Running at http://localhost:3000/");
    });
} catch(error) {
            console.log('db error: ${error.message}');
            process.exit(1);
        }
    };

initiliazeDbAndServer();

const convertMovieNameToPascalCase = (dbObject) => {
    return {
        movieName: dbObject.movie_name,
    };
};

// Returns a list of all movie names in the movie table//
app.get("/movies/", async (request, response) => {
const getAllMoviesQuery = `
SELECT 
movie_name
FROM 
movie;` ;
const moviesArray = await db.all(getAllMoviesQuery);
response.send(
    moviesArray.map((moviename)=> convertMovieNameToPascalCase(moviename))
        );
});

//ADD movie API//
app.post("/movies/", async( request, response)=> { 
    const movieDetails = request.body;
    const {directorId, movieName, leadActor} = movieDetails;
    const addMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES('${directorId}', '${movieName}', '${leadActor}');` ;
const dbResponse = await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
});

//to convert to PascalCase//
const convertDbObjectToResponseObject = (dbObject) => {
    return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor
    };
};

//Returns a movie based on movie Id//
app.get("/movies/:movieId/", async(request,response) => {
    const {movieId} = request.params;
    const getMovieQuery = `
    SELECT
    *
    FROM 
    movie 
    WHERE 
    movie_id = ${movieId};` ;
    const movie = await db.get(getMovieQuery);
    console.log(movieId);
    response.send(convertDbObjectToResponseObject(movie));
});

//UPDATE movie API//
app.put("/movies/:movieId/", async (request,response) => {
    const { movieId } = request.params;
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const updateMovieQuery = `
    UPDATE 
    movie
    SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};` ;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

//DELETE Players API//
app.delete("/movies/:movieId/", async (request,response) => {
    const {movieId} = request.params;
    const deletemovieQuery = `
    DELETE FROM
    movie
    WHERE 
    movie_id = ${movieId};` ;
    await db.run(deletemovieQuery);
    response.send("Movie Removed");
});

//Returns a list of all directors in the director table//
app.get("/directors/", async (request, response) => {
    const getDirectorQuery = `
    SELECT 
    *
    FROM
    director;` ;
    const moviesArray = await db.all(getDirectorQuery);
    response.send(
        moviesArray.map((director) => convertDirectorDetailsPascalCase(director))
    );
});

//Returns a list of all movie names directed by a specific director//
app.get("/directors/:directorId/movies/", async(request, response) => {
    const {directorId} = request.params;
    const getDirectorMoviesQuery = `
    SELECT 
    movie_name
    FROM 
    director INNER JOIN movie
     ON director.director_id = '${directorId}';` ;
    const movies = await db.all(getDirectorMoviesQuery);
    console.log(directorId);
    response.send(
        movies.map((movienames)=> convertMovieNamePascalCase(movienames))
        );
        });

module.exports = app;