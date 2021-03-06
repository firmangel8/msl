/**
 * Copyright (c) 2013-2017 Netflix, Inc.  All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.netflix.msl.util;

import java.util.Random;

import com.netflix.msl.MslConstants;

/**
 * Utility methods.
 * 
 * @author Wesley Miaw <wmiaw@netflix.com>
 */
public class MslUtils {
    /**
     * Safely compares two byte arrays to prevent timing attacks.
     * 
     * @param a first array for the comparison.
     * @param b second array for the comparison.
     * @return true if the arrays are equal, false if they are not.
     */
    public static boolean safeEquals(final byte[] a, final byte[] b) {
       if (a.length != b.length)
          return false;
       
       int result = 0;
       for (int i = 0; i < a.length; ++i)
          result |= a[i] ^ b[i];
       return result == 0;
    }
    
    /**
     * Return true if the number is a non-negative power of two. Zero is
     * considered a power of two and will return true.
     * 
     * @param n the number to test.
     * @return true if the number is a non-negative power of two.
     */
    private static boolean isPowerOf2(final long n) {
    		// If the number is a power of two, a binary AND operation between
    		// the number and itself minus one will equal zero.
    		if (n < 0) return false;
    		if (n == 0) return true;
    		return (n & (n - 1)) == 0;
    }
    
    /**
     * Returns a random number between zero and the maximum long value as
     * defined by {@link MslConstants#MAX_LONG_VALUE}, inclusive.
     * 
     * @param ctx MSL context.
     * @return a random number between zero and the maximum long value,
     *         inclusive.
     */
    public static long getRandomLong(final MslContext ctx) {
    		// If the maximum long value is a power of 2, then we can perform a
    		// bitmask on the randomly generated long value to restrict to our
    		// target number space.
    		final boolean isPowerOf2 = MslUtils.isPowerOf2(MslConstants.MAX_LONG_VALUE);
    		
    		// Generate the random value.
    		final Random r = ctx.getRandom();
    		long n = -1;
    		do {
    			n = r.nextLong();
    			
    			// Perform a bitmask if permitted, which will force this loop
    			// to exit immediately.
    			if (isPowerOf2)
    				n &= (MslConstants.MAX_LONG_VALUE - 1);
    		} while (n < 0 || n > MslConstants.MAX_LONG_VALUE);
    		
    		// Return the random value.
    		return n;
    }
}
