import {
    graphql,
    formatPageQuery,
    formatPageQueryWithCount,
    formatMutation,
    formatGQLString,
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

const PAYMENT_SUMMARIES_PROJECTION =
[
    "uuid",
    "id",
    "requestDate",
    "expectedAmount",
    "receivedDate",
    "receivedAmount",
    "status",
    "receiptNo",
    "typeOfPayment",
    // "clientMutationId",
];
const PAYMENT_FULL_PROJECTION =
[
    ...PAYMENT_SUMMARIES_PROJECTION,
    "officerCode",
    "phoneNumber",
    "transactionNo",
    "origin",
    "matchedDate",
    "rejectedReason",
    "dateLastSms",
    "languageName",
    "transferFee",
    // "clientMutationId",
];

export function fetchPremiumsPayments(mm, filters) {
    let payload = formatPageQueryWithCount("paymentsByPremiums",
        filters,
        PAYMENT_SUMMARIES_PROJECTION
    );
    return graphql(payload, 'PAYMENT_PREMIUMS_PAYMENTS');
}

export function fetchPaymentsSummaries(mm, filters) {
  const payload = formatPageQueryWithCount("payments",
    filters,
    PAYMENT_SUMMARIES_PROJECTION
  );
  return graphql(payload, 'PAYMENT_PAYMENTS');
}

export function newPayment() {
  return dispatch => {
    dispatch({ type: 'PAYMENT_NEW' })
  }
}
export function formatPaymentGQL(mm, payment) {
  const req = `
    ${payment.uuid !== undefined && payment.uuid !== null ? `uuid: "${payment.uuid}"` : ''}
    ${!!payment.receivedDate ? `receivedDate: "${payment.receivedDate}"` : ""}
    ${!!payment.requestDate ? `requestDate: "${payment.requestDate}"` : ""}
    ${!!payment.matchedDate ? `matchedDate: "${payment.matchedDate}"` : ""}
    ${!!payment.dateLastSms ? `dateLastSms: "${payment.dateLastSms}"` : ""}
    ${!!payment.expectedAmount ? `expectedAmount: "${payment.expectedAmount}"` : ""}
    ${!!payment.receivedAmount ? `receivedAmount: "${payment.receivedAmount}"` : ""}
    ${!!payment.transferFee ? `transferFee: "${payment.transferFee}"` : ""}
    ${!!payment.status ? `status: "${payment.status}"` : ""}
    ${!!payment.receiptNo ? `receiptNo: "${formatGQLString(payment.receiptNo)}"` : ""}
    ${!!payment.typeOfPayment ? `typeOfPayment: "${payment.typeOfPayment}"` : ""}
    ${!!payment.officerCode ? `officerCode: "${formatGQLString(payment.officerCode)}"` : ""}
    ${!!payment.origin ? `origin: "${formatGQLString(payment.origin)}"` : ""}
    ${!!payment.rejectedReason ? `rejectedReason: "${formatGQLString(payment.rejectedReason)}"` : ""}
  `
  return req;
}

export function createPayment(mm, payment, clientMutationLabel) {
    let mutation = formatMutation("createPayment", formatPaymentGQL(mm, payment), clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
      mutation.payload,
      ['PAYMENT_MUTATION_REQ', 'PAYMENT_CREATE_RESP', 'PAYMENT_MUTATION_ERR'],
      {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime
      }
    )
  }

export function updatePayment(mm, payment, clientMutationLabel) {
  let mutation = formatMutation("updatePayment", formatPaymentGQL(mm, payment), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['PAYMENT_MUTATION_REQ', 'PAYMENT_UPDATE_RESP', 'PAYMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      paymentUuid: payment.uuid,
    }
  )
}

export function deletePayment(mm, payment, clientMutationLabel) {
  let mutation = formatMutation("deletePayment", `uuids: ["${payment.uuid}"]`, clientMutationLabel);
  payment.clientMutationId = mutation.clientMutationId;
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['PAYMENT_MUTATION_REQ', 'PAYMENT_DELETE_RESP', 'PAYMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      paymentUuid: payment.uuid,
    }
  )
}

export function fetchPayment(mm, paymentUuid) {
    let filters = []
    if (!!paymentUuid) {
      filters.push(`uuid: "${paymentUuid}"`)
    } else if (!!clientMutationId){
      filters.push(`clientMutationId: "${clientMutationId}"`)
    }
    const payload = formatPageQuery("payments",
      filters,
      PAYMENT_FULL_PROJECTION
    );
    return graphql(payload, 'PAYMENT_OVERVIEW');
  }
