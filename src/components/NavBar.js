import React, { Fragment } from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <Fragment>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="#">
          TalkBack
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarColor02"
          aria-controls="navbarColor02"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarColor02">
          <ul className="navbar-nav mr-auto" role="nav">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link" href="#">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/prefs" className="nav-link" href="#">
                Preferences
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/commands" className="nav-link" href="#">
                Commands
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/lessons" className="nav-link" href="#">
                Lessons
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/beta" className="nav-link" href="#">
                Beta Area
              </Link>
            </li>
          </ul>
          <div className="form-inline my-2 my-lg-0">
            <button className="btn btn-secondary my-2 my-sm-0" type="submit">
              Login
            </button>
          </div>
          <div className="form-inline my-2 my-lg-0">
            <button className="btn btn-secondary my-2 my-sm-0" type="submit">
              Register
            </button>
          </div>
        </div>
      </nav>
    </Fragment>
  );
}
