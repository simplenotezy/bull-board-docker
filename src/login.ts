import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Router, Request, Response } from "express";
import config from "./config";

interface User {
	user: string;
}

const authRouter: Router = Router();

passport.use(
	new LocalStrategy(function (
		username: string,
		password: string,
		cb: (error: any, user?: User | false) => void
	) {
		if (
			username === config.USER_LOGIN &&
			password === config.USER_PASSWORD
		) {
			return cb(null, { user: "bull-board" });
		}

		return cb(null, false);
	})
);

passport.serializeUser((user: any, cb: (error: any, id?: any) => void) => {
	cb(null, user);
});

passport.deserializeUser((user: any, cb: (error: any, user?: any) => void) => {
	cb(null, user);
});

authRouter
	.route("/")
	.get((_req: Request, res: Response) => {
		res.render("login");
	})
	.post(
		passport.authenticate("local", {
			successRedirect: config.HOME_PAGE,
			failureRedirect: config.LOGIN_PAGE,
		})
	);

export { authRouter };

