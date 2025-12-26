import styles from './LoadingBar.module.css';

export const LoadingBar = () => {
    return (
        <div class={styles['loader-container']}>
            <div class={styles['loader-bar']}></div>
        </div>
    );
};
