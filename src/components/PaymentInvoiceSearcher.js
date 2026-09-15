import React, { useRef, useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  formatMessageWithValues,
  formatAmount,
  Searcher,
  formatDateFromISO,
  withModulesManager,
  coreConfirm,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchPaymentInvoices, deletePaymentInvoice } from "../actions";
import {
  DEFAULT_PAGE_SIZE,
  EMPTY_STRING,
  ROWS_PER_PAGE_OPTIONS,
} from "../constants";
import PaymentInvoiceFilter from "./PaymentInvoiceFilter";
import PaymentInvoiceStatusPicker from "../pickers/PaymentInvoiceStatusPicker"

const PaymentInvoiceSearcher = ({
  intl,
  modulesManager,
  submittingMutation,
  mutation,
  fetchPaymentInvoices,
  fetchingPaymentInvoices,
  fetchedPaymentInvoices,
  errorPaymentInvoices,
  paymentInvoices,
  paymentInvoicesPageInfo,
  paymentInvoicesTotalCount,
}) => {
  const [queryParams, setQueryParams] = useState([]);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (
      prevSubmittingMutationRef.current &&
      !submittingMutation &&
      ["PAYMENTINVOICE_CREATE_PAYMENT_INVOICE_WITH_DETAIL"].includes(mutation?.actionType)
    ) {
      refetch();
    }
  }, [submittingMutation]);
  
  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const fetch = (params) => fetchPaymentInvoices(params);

  const refetch = () => fetch(queryParams);

  const filtersToQueryParams = ({ filters, pageSize, beforeCursor, afterCursor, orderBy }) => {
    const queryParams = Object.keys(filters)
      .filter((f) => !!filters[f]["filter"])
      .map((f) => filters[f]["filter"]);
    !beforeCursor && !afterCursor && queryParams.push(`first: ${pageSize}`);
    if (afterCursor) {
      queryParams.push(`after: "${afterCursor}"`);
      queryParams.push(`first: ${pageSize}`);
    }
    if (beforeCursor) {
      queryParams.push(`before: "${beforeCursor}"`);
      queryParams.push(`last: ${pageSize}`);
    }
    orderBy && queryParams.push(`orderBy: ["${orderBy}"]`);
    setQueryParams(queryParams);
    return queryParams;
  };

  const headers = () => [
    "paymentInvoice.reconciliationStatus.label",
    "paymentInvoice.codeExt",
    "paymentInvoice.label",
    "paymentInvoice.codeTp",
    "paymentInvoice.codeReceipt",
    "paymentInvoice.fees",
    "paymentInvoice.amountReceived",
    "paymentInvoice.datePayment",
    "paymentInvoice.paymentOrigin",
    "paymentInvoice.payerRef",
  ];

  const itemFormatters = () => {
    const formatters = [
      (paymentInvoice) => <PaymentInvoiceStatusPicker value={paymentInvoice?.reconciliationStatus} readOnly />,
      (paymentInvoice) => paymentInvoice.codeExt,
      (paymentInvoice) => paymentInvoice.label,
      (paymentInvoice) => paymentInvoice.codeTp,
      (paymentInvoice) => paymentInvoice.codeReceipt,
      (paymentInvoice) => formatAmount(modulesManager, intl, paymentInvoice.fees),
      (paymentInvoice) => formatAmount(modulesManager, intl, paymentInvoice.amountReceived),
      (paymentInvoice) =>
        !!paymentInvoice.datePayment
          ? formatDateFromISO(modulesManager, intl, paymentInvoice.datePayment)
          : EMPTY_STRING,
      (paymentInvoice) => paymentInvoice.paymentOrigin,
      (paymentInvoice) => paymentInvoice.payerRef,
    ];

    return formatters;
  };

  const sorts = () => [
    ["reconciliationStatus", true],
    ["codeExt", true],
    ["label", true],
    ["codeTp", true],
    ["codeReceipt", true],
    ["fees", true],
    ["amountReceived", true],
    ["datePayment", true],
    ["paymentOrigin", true],
    ["payerRef", true],
  ];

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: "isDeleted: false",
    },
  });

  return (
    <Searcher
      module="payment"
      FilterPane={PaymentInvoiceFilter}
      fetch={fetch}
      items={paymentInvoices}
      itemsPageInfo={paymentInvoicesPageInfo}
      fetchingItems={fetchingPaymentInvoices}
      fetchedItems={fetchedPaymentInvoices}
      errorItems={errorPaymentInvoices}
      tableTitle={formatMessageWithValues(intl, "payment", "paymentInvoices.searcherResultsTitle", {
        paymentInvoicesTotalCount,
      })}
      filtersToQueryParams={filtersToQueryParams}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="codeExt"
      defaultFilters={defaultFilters()}
    />
  );
};

const mapStateToProps = (state) => ({
  fetchingPaymentInvoices: state.invoice.fetchingPaymentInvoices,
  fetchedPaymentInvoices: state.invoice.fetchedPaymentInvoices,
  errorPaymentInvoices: state.invoice.errorPaymentInvoices,
  paymentInvoices: state.invoice.paymentInvoices,
  paymentInvoicesPageInfo: state.invoice.paymentInvoicesPageInfo,
  paymentInvoicesTotalCount: state.invoice.paymentInvoicesTotalCount,
  submittingMutation: state.invoice.submittingMutation,
  mutation: state.invoice.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchPaymentInvoices,
      deletePaymentInvoice,
      coreConfirm
    },
    dispatch,
  );
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PaymentInvoiceSearcher)));
