import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from "apollo-server-express"
import {buildSchema} from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";
import { UserResolver } from "./resolvers/users";

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";


const main = async () => {
    
    const orm = await MikroORM.init(mikroConfig); // the issue is here
    await orm.getMigrator().up();

    // // const post =  orm.em.create(Post, {title: 'my first post'});
    // // await orm.em.persistAndFlush(post);

    // // const posts = await orm.em.find(Post, {});
    // // console.log(posts);

    const app = express();
    
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    redisClient.on("error", function (err) {
        console.log("Error " + err);
    });

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000*60*60*24*365*10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ // cookie only works in https
            },
            saveUninitialized: false,
            secret: 'keyboard cat', // hide this later, e.g. use env variable
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}): MyContext => ({em: orm.em, req, res})
    });

    apolloServer.applyMiddleware({app});

    app.get('/', (_,res)=>{
        res.send('hello');
    });
    
    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });
}

main().catch((err)=>{
    console.error(err);
});


