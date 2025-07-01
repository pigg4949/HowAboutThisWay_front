import React from "react";
import styles from "../css/BouncingDots.module.css";

export default function BouncingDots({ style = {} }) {
  return (
    <div className={styles.bouncing_dots} style={style}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
