import { useEffect } from "react";
import { GithubIco, GoogleIco, TwitterIco, facebookIco } from "../../assets";
import { useAddScript, useFacebook, useGithub, useGoogle, useTwitter } from "../../hooks";
import SocialBtn from "./AuthSocialBtn";
import './AuthSocialButtons.scss'
import React from "react";



const AuthSocialButtons = ({authType, redirectUrl='',socialBtn=''}:{authType :string,redirectUrl?:string,socialBtn?:string}) => {

    const {handleTwitter} = useTwitter(authType);
    const {handleFacebook} = useFacebook(authType,redirectUrl); 
    const {handleGoogle} = useGoogle(authType,redirectUrl);
    const {handleGitHub} = useGithub(authType,redirectUrl);

    

    const content = (
      <>
      <p className="hint">continue with social:</p>
      <div className='social-btns-wrapper'>
      {socialBtn !== '' ? (
        socialBtn==='Google' ? (
          <SocialBtn execFunc={handleGoogle} icon={GoogleIco} socialType={`Google`} authType={authType} id={`googleBtn`} />
        ) : (
          socialBtn ==='Github' ? (
            <SocialBtn execFunc={handleGitHub} icon={GithubIco} socialType={`Github`} authType={authType} id={`githubBtn`}  />

          ) : socialBtn === 'Facebook' ? (
            <SocialBtn execFunc={handleFacebook} icon={facebookIco} socialType={`Facebook`} authType={authType} id={`facebookBtn`}   />
          ) : (
            socialBtn==='Twitter' ? (
              <SocialBtn execFunc={handleTwitter} icon={TwitterIco} socialType={`Twitter`} authType={authType} id={`twitterBtn`}  />

            ): <h4>social was not found</h4>
          )
        )
      ) : (
        <>
        <SocialBtn execFunc={handleGoogle} icon={GoogleIco} socialType={`Google`} authType={authType} id={`googleBtn`} />
        <SocialBtn execFunc={handleFacebook} icon={facebookIco} socialType={`Facebook`} authType={authType} id={`facebookBtn`}   />
        <SocialBtn execFunc={handleTwitter} icon={TwitterIco} socialType={`Twitter`} authType={authType} id={`twitterBtn`}  />
        <SocialBtn execFunc={handleGitHub} icon={GithubIco} socialType={`Github`} authType={authType} id={`githubBtn`}  />
        </>
      )}
    </div>
      </> 
    )
    return content
  }
  
  export default React.memo(AuthSocialButtons)