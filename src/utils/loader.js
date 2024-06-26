import React from "react";
import {useSelector} from "react-redux";
import {PropagateLoader} from "react-spinners";


const Loader = (props) => {
  const isLoading = useSelector(state => {
    return state.setting.isLoading
  });


  return (

    <div className={(!isLoading && !props.load) ? "loader-model-bg-hidden" : "loader-model-bg-visible"}>
      <div className="sa-modal-bg-inner">
        <div className="loader-model">
          <div className="container">
            <div className={"sa-modal-bg loader " + ((!isLoading && !props.load) && 'hide')}>
              <div className="sa-modal-bg-inner">
                <div className="container">
                  <div className="sweet-loading d-flex justify-content-center">
                    <PropagateLoader
                      size={20}
                      color={"var(--primary)"}
                      loading={true}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  )
};

export default Loader
