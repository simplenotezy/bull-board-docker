import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Router, IRouter } from "express";
import config from "./config";

const authRouter: IRouter = Router();

passport.use(
	new LocalStrategy((username, password, cb) => {
		if (
			username === config.USER_LOGIN &&
			password === config.USER_PASSWORD
		) {
			return cb(null, { user: "bull-board" });
		}
		return cb(null, false);
	})
);

passport.serializeUser((user: any, cb) => {
	cb(null, user);
});

passport.deserializeUser((user: any, cb) => {
	cb(null, user);
});

authRouter
	.route("/")
	.get((_req, res) => {
		res.render("login");
	})
	.post(
		passport.authenticate("local", {
			successRedirect: config.HOME_PAGE,
			failureRedirect: config.LOGIN_PAGE,
		})
	);

export { authRouter };

