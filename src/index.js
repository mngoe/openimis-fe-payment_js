import React from "react";
import PaymentIcon from '@material-ui/icons/Payment';
import { FormattedMessage } from "@openimis/fe-core";

import messages_en from "./translations/en.json";
import PremiumsPaymentsOverview from "./components/PremiumsPaymentsOverview";
import PaymentOverviewPage from "./pages/PaymentOverviewPage";
import PaymentStatusPicker from "./pickers/PaymentStatusPicker";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentInvoicesPage from "./pages/PaymentInvoicesPage";
import PaymentPage from "./pages/PaymentPage";
import { PaymentsTabLabel, PaymentsTabPanel } from "./components/PaymentsTab";
import reducer from "./reducer";

import { RIGHT_PAYMENT, RIGHT_BILL_PAYMENT_SEARCH } from "./constants";


const ROUTE_PAYMENTS = "payment/payments";
const ROUTE_PAYMENTS_INVOICE = "payment/paymentsInvoice";
const ROUTE_PAYMENTS_PAYMENT = "payment/new";
const ROUTE_PAYMENTS_PAYMENT_OVERVIEW = "payment/overview";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'payment', reducer }],

  "refs": [
    { key: "payment.PaymentStatusPicker", ref: PaymentStatusPicker },
    { key: "payment.PaymentsTab.label", ref: PaymentsTabLabel },
    { key: "payment.PaymentsTab.panel", ref: PaymentsTabPanel },
    { key: "payment.payments", ref: ROUTE_PAYMENTS },
    { key: "payment.paymentNew", ref: ROUTE_PAYMENTS_PAYMENT },
    { key: "payment.paymentOverview", ref: ROUTE_PAYMENTS_PAYMENT_OVERVIEW },
  ],
  "core.Router": [
    { path: ROUTE_PAYMENTS, component: PaymentsPage },
    { path: ROUTE_PAYMENTS_INVOICE, component: PaymentInvoicesPage },
    { path: ROUTE_PAYMENTS_PAYMENT+ "/:premium_uuid", component: PaymentPage },
    { path: ROUTE_PAYMENTS_PAYMENT_OVERVIEW + "/:payment_uuid", component: PaymentOverviewPage },
  ],
  "insuree.FamilyOverview.panels": [PremiumsPaymentsOverview],
  "insuree.MainMenu": [
    {
      text: <FormattedMessage module="payment" id="menu.payments" />,
      icon: <PaymentIcon />,
      route: "/" + ROUTE_PAYMENTS,
      filter: rights => rights.includes(RIGHT_PAYMENT)
    }
  ],
  "invoice.MainMenu": [
    {
      text: <FormattedMessage module="payment" id="menu.payments" />,
      icon: <PaymentIcon />,
      route: "/" + ROUTE_PAYMENTS_INVOICE,
      filter: (rights, modulesManager) => {
        const paymentsMenuEnabled = modulesManager.getConf(
          "fe-payment",
          "payment.paymentsMenuEnabled",
          false,
        );
        return paymentsMenuEnabled && rights.includes(RIGHT_BILL_PAYMENT_SEARCH);
      }
    }
  ]
}

export const PaymentModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}