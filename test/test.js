const supertest = require("supertest");
const should = require("should");

const server = supertest.agent("http://localhost:3000");

/*
  * Test the /GET route
  */

describe("TEST API /hello/<username>",function(){
    it("should find the user and greet him in the <message> property",function(done){
        server
            .get("/hello/tester")
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                should(res.status).be.equal(200);
                should(res.body).have.ownProperty('message')
                done();
            });
    });
    it("should not find this user",function(done){
        server
            .get("/hello/testertestertesterasdasdasdasdsadasd")
            .expect("Content-type",/json/)
            .expect(404)
            .end(function(err,res){
                should(res.status).be.equal(404);
                should(res.body).have.ownProperty('error')
                done();
            });
    });
    it("should create this user",function(done){
        server
            .put("/hello/asdfxv")
            .send({ dateOfBirth: '2000-10-10'})
            .expect("Content-type",/json/)
            .expect(204)
            .end(function(err,res){
                should(res.status).be.equal(204);
                done();
            });
    });
    it("should not create this user - invalid username",function(done){
        server
            .put("/hello/asdfx123")
            .send({ dateOfBirth: '2000-10-10'})
            .expect("Content-type",/json/)
            .expect(500)
            .end(function(err,res){
                should(res.status).be.equal(500);
                done();
            });
    });
    it("should not create this user - invalid birthdate",function(done){
        server
            .put("/hello/validUsername")
            .send({ dateOfBirth: '2999-10-10'})
            .expect("Content-type",/json/)
            .expect(500)
            .end(function(err,res){
                should(res.status).be.equal(500);
                done();
            });
    });
});