import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="mt-16 border-t lg:h-96 border-outline-variant pt-8 pb-6">
        <div className="container-main px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <h2 className="display-lg ml-0 md:ml-8 xl:ml-50 text-primary-container">GharDhundho</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
            <a href="/about" className="nav-link underline text-body-sm">
              ABOUT US
            </a>
            <a href="#" className="nav-link underline text-body-sm">
              TERMS OF SERVICE
            </a>
            <a href="#" className="nav-link underline text-body-sm">
              PRIVACY POLICY
            </a>
            <a href="#" className="nav-link underline text-body-sm">
              CONTACT
            </a>
            <a href="#" className="nav-link underline text-body-sm">
              SUPPORT
            </a>
          </div>
        </div>

        <div className="container-main px-6 mt-10 lg:mt-60 text-center text-sm text-on-surface-variant">
          © 2024 GHARDHUNDHO. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </>
  );
};

export default Footer;
