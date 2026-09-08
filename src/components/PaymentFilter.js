import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid, Checkbox, FormControlLabel } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  withModulesManager,
  AmountInput,
  PublishedComponent,
  ControlledField,
  TextInput,
  formatMessage,
} from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
    width: "100%",
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

const PAYMENT_FILTER_CONTRIBUTION_KEY = "payment.Filter";

class PaymentFilter extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-payment", "debounceTime", 200)
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _filterTextFieldValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : "";
  };

  _onChangeCheckbox = (key, value) => {
    let filters = [
      {
        id: key,
        value: value,
        filter: `${key}: ${value}`,
      },
    ];
    this.props.onChangeFilters(filters);
  };

  onChangeDecimalFilter = (field) => (value) => {
    const raw = String(value ?? "").replace(/\s/g, "").replace(",", ".");
    if (!raw) {
      this.debouncedOnChangeFilter([{ id: field, value: null, filter: null }]);
      return;
    }
    const parsed = Number(raw);
    const decimalValue = Number.isFinite(parsed) ? parsed.toFixed(2) : null;
    this.debouncedOnChangeFilter([
      { id: field, value: decimalValue, filter: decimalValue ? `${field}: "${decimalValue}"` : null },
    ]);
  };

  render() {
    const { classes, filters, onChangeFilters, intl } = this.props;
    return (
      <section className={classes.form}>
        <Grid container>
          <ControlledField
            module="payment"
            id="PaymentFilter.typeOfPayment"
            field={
              <Grid item xs={3} className={classes.item}>
                <PublishedComponent
                  pubRef="contribution.PremiumPaymentTypePicker"
                  withNull={true}
                  value={this._filterValue("typeOfPayment")}
                  onChange={(v) =>
                    onChangeFilters([
                      {
                        id: "typeOfPayment",
                        value: v,
                        filter: !!v ? `typeOfPayment: "${v}"` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module="payment"
            id="PaymentFilter.status"
            field={
              <Grid item xs={3} className={classes.item}>
                <PublishedComponent
                  pubRef="payment.PaymentStatusPicker"
                  withNull={true}
                  value={this._filterValue("status")}
                  onChange={(v) =>
                    onChangeFilters([
                      {
                        id: "status",
                        value: v,
                        filter: !!v ? `status: ${v}` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module="contribution"
            id="PaymentFilter.receiptNo"
            field={
              <Grid item xs={3} className={classes.item}>
                <TextInput
                  module="payment"
                  label="payment.receiptNo"
                  name="receiptNo"
                  value={this._filterTextFieldValue("receiptNo")}
                  onChange={(v) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: "receiptNo",
                        value: v,
                        filter: `receiptNo_Icontains: "${v}"`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
        </Grid>
        <Grid container>
          <ControlledField
            module="payment"
            id="PaymentFilter.requestDate"
            field={
              <Grid item xs={6}>
                <Grid container>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("requestDateFrom")}
                      module="payment"
                      label="payment.requestDateFrom"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "requestDateFrom",
                            value: d,
                            filter: `requestDate_Gte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("requestDateTo")}
                      module="payment"
                      label="payment.requestDateTo"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "requestDateTo",
                            value: d,
                            filter: `requestDate_Lte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
          <ControlledField
            module="payment"
            id="PaymentFilter.receivedDate"
            field={
              <Grid item xs={6}>
                <Grid container>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("receivedDateFrom")}
                      module="payment"
                      label="payment.receivedDateFrom"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "receivedDateFrom",
                            value: d,
                            filter: `receivedDate_Gte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("receivedDateTo")}
                      module="payment"
                      label="payment.receivedDateTo"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "receivedDateTo",
                            value: d,
                            filter: `receivedDate_Lte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
        </Grid>
        <Grid container>
          {["expectedAmount_Gte", "expectedAmount_Lte"].map((a) => (
            <ControlledField
              module="payment"
              id="PaymentFilter.amountUnder"
              key={a}
              field={
                <Grid item xs={3} className={classes.item}>
                  <AmountInput
                    module="payment"
                    label={`payment.${a}`}
                    value={filters[a] && filters[a]["value"]}
                    onChange={this.onChangeDecimalFilter(a)}
                  />
                </Grid>
              }
            />
          ))}
          {["receivedAmount_Gte", "receivedAmount_Lte"].map((a) => (
            <ControlledField
              module="payment"
              id="PaymentFilter.amountUnder"
              key={a}
              field={
                <Grid item xs={3} className={classes.item}>
                  <AmountInput
                    module="payment"
                    label={`payment.${a}`}
                    value={filters[a] && filters[a]["value"]}
                    onChange={this.onChangeDecimalFilter(a)}
                  />
                </Grid>
              }
            />
          ))}
        </Grid>

        <Grid container>
          <ControlledField
            module="payment"
            id="PaymentFilter.showReconciled"
            field={
              <Grid item xs={2} className={classes.item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={!!this._filterValue("showReconciled")}
                      onChange={(event) =>
                        this._onChangeCheckbox(
                          "showReconciled",
                          event.target.checked
                        )
                      }
                    />
                  }
                  label={formatMessage(intl, "payment", "showReconciledOnly")}
                />
              </Grid>
            }
          />
          <ControlledField
            module="payment"
            id="PaymentFilter.showHistory"
            field={
              <Grid item xs={2} className={classes.item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={!!this._filterValue("showHistory")}
                      onChange={(event) =>
                        this._onChangeCheckbox(
                          "showHistory",
                          event.target.checked
                        )
                      }
                    />
                  }
                  label={formatMessage(intl, "payment", "showHistory")}
                />
              </Grid>
            }
          />
        </Grid>
      </section>
    );
  }
}

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(PaymentFilter)))
);
