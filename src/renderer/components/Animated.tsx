import { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

const AnimatedComponent: FC<PropsWithChildren> = ({ children }) => (
    <motion.div
        transition={{
            duration: 0.5
        }}
        initial={{
            opacity: 0
        }}
        animate={{
            opacity: 1
        }}
        exit={{
            opacity: 0
        }}
    >
        {children}
    </motion.div>
);

export default AnimatedComponent;
