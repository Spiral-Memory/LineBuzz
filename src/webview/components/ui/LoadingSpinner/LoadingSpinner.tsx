import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = () => (
    <div class={styles['loading-spinner-container']}>
        <div class={styles['loading-spinner']}></div>
    </div>
);
