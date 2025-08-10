import { FormCard } from "@mighty-justice/fields-ant";
import autoBindMethods from "class-autobind-decorator";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import Store from "../../store";

interface IProps extends RouteComponentProps {
  store: Store;
}

@inject("store")
@autoBindMethods
@observer
class PageLogin extends Component<IProps> {
  private async onSave(model: any) {
    await this.props.store.login(model.username, model.password);
    this.props.history.push("/");
  }

  public render() {
    if (this.props.store.isAuthenticated) {
      this.props.history.push("/");
    }

    return (
      <div className="login-form">
        <FormCard
          fieldSets={[
            [
              { field: "username", required: true },
              { field: "password", required: true },
            ],
          ]}
          blockSubmit
          onSave={this.onSave}
          saveText="Submit"
          title="Log in"
        />
      </div>
    );
  }
}

export default PageLogin;
