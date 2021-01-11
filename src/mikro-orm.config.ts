import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";
import { MikroORM } from "@mikro-orm/core"
import path from "path";
import { User } from "./entities/Users";

export default{
    migrations:{
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/, 
    },
    entities: [Post, User],
    dbName: 'lireddit',    
    type: 'postgresql',
    port: 5433,
    password: '1',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];