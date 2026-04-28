import { Types } from "mongoose";
import { createClient , RedisClientType } from "redis";
import { REDIS_URL } from "../../config/config.service";
import { EventEnum } from "../enum/event.enum";


// ================== KEYS ==================

class redisService {
    private readonly client: RedisClientType

    constructor(){ 
        this.client = createClient({
            url: REDIS_URL!
        })
    }
    async connect() {
    await this.client.connect();
    console.log("Connection to Redis successful");
}




revoked_key = ({ userId, jti }: { userId: Types.ObjectId; jti: string }) => {
    return `revoke_token:${userId}:${jti}`;
};

get_key = (userId: Types.ObjectId) => {
    return `get_token:${userId}`;
};

otp_key = ({
    email,
    subject = EventEnum.confirmEmail
}: {
    email: string;
    subject?: EventEnum;
}) => {
    return `otp:${email}:${subject}`;
};


max_otp_key = (email: string) => {
    return `${this.otp_key({ email })}:max`;
};

blocked_otp_key = (email: string) => {
    return `${this.otp_key({ email })}:blocked`;
};


// ================== SET ==================

setValue = async ({
    key,
    value,
    ttl
}: {
    key: string;
    value: string | object;
    ttl?: number;
}) => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value);

        return ttl
            ? await this.client.set(key, data, { EX: ttl })
            : await this.client.set(key, data);

    } catch (error) {
        console.log(error, "Failed to set operation");
    }
};


// ================== UPDATE ==================

updateValue = async (
  {
    key,
    value,
    ttl
  }: {
    key: string;
    value: string | object;
    ttl?: number;
  }
) => {
  try {
    return await this.setValue({key,value,ttl} as {key: string; value: string | object; ttl?: number;});
  } catch (error) {
    console.log(error, "Failed to update operation");
  }
};


// ================== GET ==================

getValue = async (key: string) => {
    try {
        const data = await this.client.get(key);
        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch {
            return data;
        }

    } catch (error) {
        console.log(error, "Failed to get operation");
    }
};


// ================== TTL ==================

ttl = async (key: string) => {
    try {
        return await this.client.ttl(key);
    } catch (error) {
        console.log(error, "Failed to get TTL operation");
    }
};


// ================== EXISTS ==================

exists = async (key: string) => {
    try {
        return await this.client.exists(key);
    } catch (error) {
        console.log(error, "Failed to get exists operation");
    }
};


// ================== EXPIRE ==================

expire = async ({
    key,
    ttl
}: {
    key: string;
    ttl: number;
}) => {
    try {
        return await this.client.expire(key, ttl);
    } catch (error) {
        console.log(error, "Failed to expire operation");
    }
};


// ================== DELETE ==================

deleteKey = async (key: string | string[]) => {
    try {
        return await this.client.del(key);
    } catch (error) {
        console.log(error, "Failed to delete operation");
    }
};


// ================== KEYS (SCAN) ==================

keys = async (pattern: string) => {
    try {
        const result: string[] = [];

        for await (const key of this.client.scanIterator({
            MATCH: pattern
        })) {
            result.push(String(key));
        }

        return result;
    } catch (error) {
        console.log(error, "Failed to get keys operation");
    }
};

// ================== INCREMENT ==================

incr = async (key: string) => {
    try {
        return await this.client.incr(key);
    } catch (error) {
        console.log(error, "Failed to incr operation");
    }
};
}
export default new redisService();