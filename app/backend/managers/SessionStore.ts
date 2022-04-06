import * as session from 'express-session';
import {FirestoreStore, StoreOptions} from '@google-cloud/connect-firestore';

export class SessionStore {
    private static store:FirestoreStore;
    public static set(dataset:FirebaseFirestore.Firestore, kind:string):FirestoreStore {
        this.store = new FirestoreStore({dataset, kind});
        return this.store;
    }
    public static get():FirestoreStore {
        return this.store;
    }
}